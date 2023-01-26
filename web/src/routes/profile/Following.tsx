import { Button, Card, Flex, SegmentedControl } from "@mantine/core";
import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Profile from "../../components/Profile"
import ProfileSummary from "../../components/ProfileSummary"
import { request, sage } from "../../stores/api";
import { useUserStore } from "../../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  order: "newer" | "older";
}

function Following() {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, order: "newer" }
  )

  const { t } = useTranslation();
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const following = useUserStore(state => state.getUserFollowing(user));

  const fetchFollowing = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useUserStore.getState().getUserFollowingAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowing", { userId: user.id, type, anchorId }), },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error);
    const following = res?.a.data;

    if (following) useUserStore.getState().addUserFollowing(user, following);

    setState({ ...state, loading: false, status: status });
  }

  const fetchRoute = async (): Promise<boolean> => {
    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserFollowing", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const following = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (following) useUserStore.getState().setUsers(following);
    if (user && following) useUserStore.getState().addUserFollowing(user, following);

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
            <Button radius="md" fullWidth variant="default" onClick={() => fetchFollowing("newer", true)}>{t("refresh")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={() => fetchFollowing("newer")}>{t("loadNewer")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={() => fetchFollowing("older")}>{t("loadOlder")}</Button>
          </Button.Group>
        </Flex>
      </Card>

      {following.map((_following) => <ProfileSummary key={_following.id} user={_following} />)}
    </>
  )
}

export default Following