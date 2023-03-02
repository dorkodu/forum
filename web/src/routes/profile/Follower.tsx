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

function Follower() {
  const { t } = useTranslation();
  const state = useAppStore(state => state.options.followers);
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const followers = useUserStore(_state => _state.getUserFollowers(user, state.order));

  const [userProps, setUserProps] = useFeedProps({ loader: user ? undefined : "top" });
  const [followerProps, setFollowerProps] = useFeedProps();

  const fetchFollowers = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!user) return;
    if (!skipWaiting && followerProps.loader) return;

    setFollowerProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = useUserStore.getState().getUserFollowersAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowers", { userId: user.id, type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const followers = res?.a.data;

    if (refresh) useUserStore.setState(state => { user && delete state.user.followers[user.id] });
    if (followers) {
      useUserStore.getState().setUsers(followers);
      useUserStore.getState().addUserFollowers(user, followers);
    }

    setFollowerProps(s => ({
      ...s, loader: undefined, status, hasMore: followers?.length !== 0
    }));
  }

  const fetchRoute = async () => {
    setUserProps(s => ({ ...s, loader: "top", status: undefined }));

    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserFollowers", { type: state.order, anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const followers = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (followers) useUserStore.getState().setUsers(followers);
    if (user && followers) useUserStore.getState().addUserFollowers(user, followers);

    setUserProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const changeOrder = (value: string) => {
    // See /routes/Home.tsx for explanation
    if (followerProps.loader) return;

    if (value === "newer" || value === "older") {
      useAppStore.setState(s => { s.options.followers.order = value });

      // Clear followers when changing the order
      useUserStore.setState(state => { user && delete state.user.followers[user.id] });
    }
  }

  useEffect(() => {
    !user && fetchRoute();
    followers.length === 0 && fetchFollowers(state.order, false);
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

    <InfiniteScroll
      refresh={fetchRoute}
      next={() => fetchFollowers(state.order, false, true)}
      length={followers.length}
      hasMore={followerProps.hasMore}
    >
      <Profile user={user} />

      <CardPanel
        segments={[
          {
            value: state.order,
            setValue: changeOrder,
            label: t("followersOrder"),
            data: [
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]
          },
        ]}
      />

      {followers.map((follower) => <ProfileSummary key={follower.id} user={follower} />)}
    </InfiniteScroll>
  )
}

export default Follower