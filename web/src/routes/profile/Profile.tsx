import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import CardAlert from "../../components/cards/CardAlert";
import CardLoader from "../../components/cards/CardLoader";
import CardPanel from "../../components/cards/CardPanel";
import DiscussionSummary from "../../components/DiscussionSummary";
import { useFeedProps, useWait } from "../../components/hooks";
import InfiniteScroll from "../../components/InfiniteScroll";
import Profile from "../../components/Profile"
import { request, sage } from "../../stores/api";
import { useAppStore } from "../../stores/appStore";
import { useDiscussionStore } from "../../stores/discussionStore";
import { useUserStore } from "../../stores/userStore";

function ProfileRoute() {
  const { t } = useTranslation();
  const state = useAppStore(state => state.options.profile);
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const discussions = useDiscussionStore(_state => _state.getUserDiscussions(user?.id, state.order));

  const [userProps, setUserProps] = useFeedProps({ loader: user ? undefined : "top" });
  const [discussionProps, setDiscussionProps] = useFeedProps();

  const fetchDiscussions = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!user) return;
    if (!skipWaiting && discussionProps.loader) return;

    setDiscussionProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = useDiscussionStore.getState().getUserDiscussionAnchor(user.id, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserDiscussions", { userId: user.id, type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const discussions = res?.a.data;

    if (refresh) useDiscussionStore.setState(state => { user && delete state.discussion.users[user.id] });
    if (discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    setDiscussionProps(s => ({
      ...s, loader: undefined, status, hasMore: discussions?.length !== 0
    }));
  }

  const fetchRoute = async () => {
    setUserProps(s => ({ ...s, loader: "top", status: undefined }));

    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserDiscussions", { type: state.order, anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const discussions = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (user && discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    setUserProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const changeOrder = (value: string) => {
    // See /routes/Home.tsx for explanation
    if (discussionProps.loader) return;

    if (value === "newer" || value === "older") {
      useAppStore.setState(s => { s.options.profile.order = value });

      // Clear feed when changing the order
      useDiscussionStore.setState(state => { user && delete state.discussion.users[user.id] });
    }
  }

  useEffect(() => {
    !user && fetchRoute();
    discussions.length === 0 && fetchDiscussions(state.order, false);
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
      next={() => fetchDiscussions(state.order, false, true)}
      length={discussions.length}
      hasMore={discussionProps.hasMore}
    >
      <Profile user={user} />

      <CardPanel
        segments={[
          {
            value: state.order,
            setValue: changeOrder,
            label: t("discussionOrder"),
            data: [
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]
          },
        ]}
      />

      {discussions.map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
    </InfiniteScroll>
  )
}

export default ProfileRoute