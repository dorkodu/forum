import { Button, Card, Flex, SegmentedControl } from "@mantine/core";
import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import DiscussionSummary from "../components/DiscussionSummary";
import { request, sage } from "../stores/api";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  order: "newer" | "older";
  feed: "user" | "favourite" | "guest";
}


function Home() {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, order: "newer", feed: "guest" }
  )

  const { t } = useTranslation();
  const userFeed = useDiscussionStore(_state => _state.getUserFeedDiscussions(state.order));
  const favouriteFeed = useDiscussionStore(_state => _state.getFavouriteFeedDiscussions(state.order));
  const guestFeed = useDiscussionStore(_state => _state.getGuestFeedDiscussions(state.order));

  const fetchUserFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useDiscussionStore.getState().getUserFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getUserDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (discussions) useDiscussionStore.getState().addUserFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState({ ...state, loading: false, status: status });
  }

  const fetchFavouriteFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useDiscussionStore.getState().getFavouriteFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getFavouriteDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (discussions) useDiscussionStore.getState().addFavouriteFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState({ ...state, loading: false, status: status });
  }

  const fetchGuestFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useDiscussionStore.getState().getGuestFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getGuestDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (discussions) useDiscussionStore.getState().addGuestFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState({ ...state, loading: false, status: status });
  }

  const refresh = () => {
    switch (state.feed) {
      case "user": fetchUserFeed("newer", true); break;
      case "favourite": fetchFavouriteFeed("newer", true); break;
      case "guest": fetchGuestFeed("newer", true); break;
    }
  }

  const loadNewer = () => {
    switch (state.feed) {
      case "user": fetchUserFeed("newer"); break;
      case "favourite": fetchFavouriteFeed("newer"); break;
      case "guest": fetchGuestFeed("newer"); break;
    }
  }

  const loadOlder = () => {
    switch (state.feed) {
      case "user": fetchUserFeed("older"); break;
      case "favourite": fetchFavouriteFeed("older"); break;
      case "guest": fetchGuestFeed("older"); break;
    }
  }

  const feed = () => {
    switch (state.feed) {
      case "user": return userFeed;
      case "favourite": return favouriteFeed;
      case "guest": return guestFeed;
    }
  }

  useEffect(() => { fetchGuestFeed("newer", true) }, []);

  return (
    <>
      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <Flex direction="column" gap="md">
          <SegmentedControl radius="md" fullWidth
            value={state.feed}
            onChange={(feed: typeof state.feed) => setState({ ...state, feed })}
            data={[
              { label: t("userFeed"), value: "user" },
              { label: t("favouriteFeed"), value: "favourite" },
              { label: t("guestFeed"), value: "guest" },
            ]}
          />

          <SegmentedControl radius="md" fullWidth
            value={state.order}
            onChange={(order: typeof state.order) => setState({ ...state, order })}
            data={[
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]}
          />

          <Button.Group>
            <Button radius="md" fullWidth variant="default" onClick={refresh}>{t("refresh")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={loadNewer}>{t("loadNewer")}</Button>
            <Button radius="md" fullWidth variant="default" onClick={loadOlder}>{t("loadOlder")}</Button>
          </Button.Group>
        </Flex>
      </Card>

      {feed().map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
    </>
  )
}

export default Home