import { Button, Card, Flex, SegmentedControl } from "@mantine/core";
import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import DiscussionSummary from "../../components/DiscussionSummary";
import Profile from "../../components/Profile"
import { request, sage } from "../../stores/api";
import { useDiscussionStore } from "../../stores/discussionStore";
import { useUserStore } from "../../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  order: "newer" | "older";
}

function ProfileRoute() {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, order: "newer" }
  )

  const { t } = useTranslation();
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const discussions = useDiscussionStore(_state => _state.getUserDiscussions(user?.id, state.order));

  const fetchDiscussions = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useDiscussionStore.getState().getUserDiscussionAnchor(user.id, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserDiscussions", { userId: user.id, type, anchorId }), },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error);
    const discussions = res?.a.data;

    if (discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    setState({ ...state, loading: false, status: status });
  }

  const fetchRoute = async (): Promise<boolean> => {
    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserDiscussions", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const discussions = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (user && discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    return status;
  }

  useEffect(() => {
    (async () => {
      setState({ ...state, loading: true, status: undefined });
      const status = await fetchRoute();
      setState({ ...state, loading: false, status: status });
    })()
  }, [])

  if (!user) {
    return (
      <>
        {state.loading && <>loading...</>}
        {state.status === false && <>fail...</>}
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
            onChange={(order: typeof state.order) => setState({ ...state, order })}
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

      {discussions.map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
    </>
  )
}

export default ProfileRoute