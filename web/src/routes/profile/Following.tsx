import { IconRefresh } from "@tabler/icons";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import CardAlert from "../../components/cards/CardAlert";
import CardPanel from "../../components/cards/CardPanel";
import { useFeedProps, useWait } from "../../components/hooks";
import InfiniteScroll from "../../components/InfiniteScroll";
import Profile from "../../components/Profile"
import ProfileSummary from "../../components/ProfileSummary"
import { request, sage } from "../../stores/api";
import { useAppStore } from "../../stores/appStore";
import { useUserStore } from "../../stores/userStore";

function Following() {
  const { t } = useTranslation();

  const state = useAppStore(state => state.options.following);
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const following = useUserStore(_state => _state.getUserFollowing(user, state.order));

  const [userProps, setUserProps] = useFeedProps({ loading: !user });
  const [followingProps, setFollowingProps] = useFeedProps();

  const fetchFollowing = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!user) return;
    if (!skipWaiting && followingProps.loading) return;

    setFollowingProps(s => ({ ...s, loading: true, status: undefined }));

    const anchorId = useUserStore.getState().getUserFollowingAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowing", { userId: user.id, type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const following = res?.a.data;

    if (refresh) useUserStore.setState(state => { user && delete state.user.following[user.id] });
    if (following) {
      useUserStore.getState().setUsers(following);
      useUserStore.getState().addUserFollowing(user, following);
    }

    setFollowingProps(s => ({ ...s, loading: false, status, hasMore: following?.length !== 0 }));
  }

  const fetchRoute = async () => {
    setUserProps(s => ({ ...s, loading: true, status: undefined }));

    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserFollowing", { type: state.order, anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const following = res?.b.data;

    // Clear feed when fetching route since it's used by infinite scroll
    useUserStore.setState(state => { user && delete state.user.following[user.id] });

    if (user) useUserStore.getState().setUsers([user]);
    if (following) useUserStore.getState().setUsers(following);
    if (user && following) useUserStore.getState().addUserFollowing(user, following);

    setUserProps(s => ({ ...s, loading: false, status: status }));
    setFollowingProps(s => ({ ...s, hasMore: true }));
  }

  const changeOrder = (value: string) => {
    // See /routes/Home.tsx for explanation
    if (followingProps.loading) return;

    if (value === "newer" || value === "older") {
      useAppStore.setState(s => { s.options.following.order = value });

      // Clear following when changing the order
      useUserStore.setState(state => { user && delete state.user.following[user.id] });
    }
  }

  useEffect(() => {
    if (!user) fetchRoute();
    else following.length === 0 && fetchFollowing(state.order, false);
  }, [state.order]);

  return (
    <InfiniteScroll
      refresh={fetchRoute}
      next={() => fetchFollowing(state.order, false, true)}
      length={following.length}
      hasMore={followingProps.hasMore}
      hideLoader={!user}
    >
      {!user || userProps.loading ?
        <>
          {userProps.status === false &&
            <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
          }
        </>

        :

        <>
          <Profile user={user} />

          <CardPanel
            segments={[
              {
                value: state.order,
                setValue: changeOrder,
                label: t("followingOrder"),
                data: [
                  { label: t("newer"), value: "newer" },
                  { label: t("older"), value: "older" },
                ],
                buttons: [{ icon: IconRefresh, onClick: fetchRoute }]
              },
            ]}
          />

          {following.map((_following) => <ProfileSummary key={_following.id} user={_following} />)}
        </>
      }
    </InfiniteScroll>
  )
}

export default Following