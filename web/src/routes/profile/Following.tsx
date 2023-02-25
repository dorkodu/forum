import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import CardAlert from "../../components/cards/CardAlert";
import CardLoader from "../../components/cards/CardLoader";
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
  const following = useUserStore(state => state.getUserFollowing(user));

  const [userProps, setUserProps] = useFeedProps({ loader: user ? undefined : "top" });
  const [followingProps, setFollowingProps] = useFeedProps();

  const fetchFollowing = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;
    if (followingProps.loader) return;

    setFollowingProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = useUserStore.getState().getUserFollowingAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowing", { userId: user.id, type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const following = res?.a.data;

    if (refresh) useUserStore.setState(state => { user && delete state.user.following[user.id] });
    if (following) useUserStore.getState().addUserFollowing(user, following);

    setFollowingProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const fetchRoute = async () => {
    setUserProps(s => ({ ...s, loader: "top", status: undefined }));

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

    if (user) useUserStore.getState().setUsers([user]);
    if (following) useUserStore.getState().setUsers(following);
    if (user && following) useUserStore.getState().addUserFollowing(user, following);

    setUserProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const changeOrder = (value: string) => {
    if (value === "newer" || value === "older") {
      useAppStore.setState(s => { s.options.following.order = value });

      // Clear following when changing the order
      useUserStore.setState(state => { user && delete state.user.following[user.id] });
    }
  }

  useEffect(() => {
    !user && fetchRoute();
    following.length === 0 && fetchFollowing(state.order, false);
  }, [state.order]);

  if (!user || userProps.loader) {
    return (
      <>
        {userProps.loader && <CardLoader />}
        {userProps.status === false &&
          <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
        }
      </>
    )
  }

  return (
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
            ]
          },
        ]}
      />

      <InfiniteScroll
        onBottom={() => fetchFollowing(state.order, false)}
        loader={followingProps.loader}
      >
        {following.map((_following) => <ProfileSummary key={_following.id} user={_following} />)}
      </InfiniteScroll>
    </>
  )
}

export default Following