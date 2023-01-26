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

function Follower() {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, order: "newer" }
  )

  const { t } = useTranslation();
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const followers = useUserStore(state => state.getUserFollowers(user));

  const fetchFollowers = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useUserStore.getState().getUserFollowersAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowers", { userId: user.id, type, anchorId }), },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error);
    const followers = res?.a.data;

    if (followers) useUserStore.getState().addUserFollowers(user, followers);

    setState({ ...state, loading: false, status: status });
  }

  const fetchRoute = async (): Promise<boolean> => {
    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserFollowers", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const followers = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (followers) useUserStore.getState().setUsers(followers);
    if (user && followers) useUserStore.getState().addUserFollowers(user, followers);

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
            <Button radius="md" fullWidth variant="default" onClick={() => fetchFollowers("newer", true)}>{t("refresh")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={() => fetchFollowers("newer")}>{t("loadNewer")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={() => fetchFollowers("older")}>{t("loadOlder")}</Button>
          </Button.Group>
        </Flex>
      </Card>

      {followers.map((follower) => <ProfileSummary key={follower.id} user={follower} />)}
    </>
  )
}

export default Follower