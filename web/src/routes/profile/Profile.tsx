import { Button, Card, Flex, SegmentedControl } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import CardAlert from "../../components/cards/CardAlert";
import CardLoader from "../../components/cards/CardLoader";
import DiscussionSummary from "../../components/DiscussionSummary";
import { useWait } from "../../components/hooks";
import InfiniteScroll from "../../components/InfiniteScroll";
import Profile from "../../components/Profile"
import { request, sage } from "../../stores/api";
import { useDiscussionStore } from "../../stores/discussionStore";
import { useUserStore } from "../../stores/userStore";

interface State {
  user: {
    loading: boolean;
    status: boolean | undefined;

  }
  discussion: {
    loading: boolean;
    status: boolean | undefined;
  }

  order: "newer" | "older";
  loader: "top" | "bottom" | "mid" | undefined;
}

function ProfileRoute() {
  const [state, setState] = useState<State>({
    user: { loading: true, status: undefined },
    discussion: { loading: false, status: undefined },

    order: "newer",
    loader: undefined,
  });

  const { t } = useTranslation();
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const discussions = useDiscussionStore(_state => _state.getUserDiscussions(user?.id, state.order));

  const fetchDiscussions = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;
    if (state.discussion.loading) return;

    setState(s => ({
      ...s, discussion: { ...s.discussion, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
    }));

    const anchorId = useDiscussionStore.getState().getUserDiscussionAnchor(user.id, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserDiscussions", { userId: user.id, type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const discussions = res?.a.data;

    if (discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    setState(s => ({
      ...s, discussion: { ...s.discussion, loading: false, status: status },
      loader: undefined,
    }));
  }

  const fetchRoute = async () => {
    setState(s => ({
      ...s, user: { ...s.user, loading: true, status: undefined },
      loader: "mid"
    }));

    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserDiscussions", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const discussions = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (user && discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    setState(s => ({
      ...s, user: { ...s.user, loading: false, status: status },
      loader: undefined
    }));
  }

  useEffect(() => { fetchRoute() }, []);

  if (!user || state.user.loading) {
    return (
      <>
        {state.user.loading && <CardLoader />}
        {state.user.status === false &&
          <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
        }
      </>
    )
  }

  return (
    <>
      <Profile user={user} />

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <Flex direction="column" gap="md">
          <SegmentedControl radius="md" fullWidth
            value={state.order}
            onChange={(order: typeof state.order) => setState(s => ({ ...s, order }))}
            data={[
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]}
          />

          <Button.Group>
            <Button radius="md" fullWidth variant="default" onClick={() => fetchDiscussions("newer", true)}>{t("refresh")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={() => fetchDiscussions("newer")}>{t("loadNewer")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={() => fetchDiscussions("older")}>{t("loadOlder")}</Button>
          </Button.Group>
        </Flex>
      </Card>

      <InfiniteScroll
        onTop={() => fetchDiscussions("newer")}
        onBottom={() => fetchDiscussions("older")}
        loaders={{ top: state.loader === "top", bottom: state.loader === "bottom", mid: state.loader === "mid" }}
      >
        {discussions.map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
      </InfiniteScroll>
    </>
  )
}

export default ProfileRoute