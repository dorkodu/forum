import { useEffect, useState } from "react";
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
import { useDiscussionStore } from "../../stores/discussionStore";
import { useUserStore } from "../../stores/userStore";

interface State {
  order: "newer" | "older";
}

function ProfileRoute() {
  const [state, setState] = useState<State>({ order: "newer" });

  const { t } = useTranslation();
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const discussions = useDiscussionStore(_state => _state.getUserDiscussions(user?.id, state.order));

  const [userProps, setUserProps] = useFeedProps({ loader: "top" });
  const [discussionProps, setDiscussionProps] = useFeedProps();

  const fetchDiscussions = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;
    if (discussionProps.loader) return;

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

    setDiscussionProps(s => ({ ...s, loader: undefined, status: status }));
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
    if (value === "newer" || value === "older") {
      setState(s => ({ ...s, order: value }));

      // Clear feed when changing the order
      useDiscussionStore.setState(state => { user && delete state.discussion.users[user.id] });
      fetchDiscussions(value, true);
    }
  }

  useEffect(() => { fetchRoute() }, []);

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
            label: t("discussionOrder"),
            data: [
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]
          },
        ]}
      />

      <InfiniteScroll
        onTop={() => fetchRoute()}
        onBottom={() => fetchDiscussions(state.order, false)}
        loader={discussionProps.loader}
      >
        {discussions.map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
      </InfiniteScroll>
    </>
  )
}

export default ProfileRoute