import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CardPanel from "../components/cards/CardPanel";
import DiscussionSummary from "../components/DiscussionSummary";
import { useFeedProps, useWait } from "../components/hooks";
import { request, sage } from "../stores/api";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import InfiniteScroll from '../components/InfiniteScroll';

interface State {
  order: "newer" | "older";
  feed: "user" | "favourite" | "guest";
}

function Home() {
  const [state, setState] = useState<State>({ order: "newer", feed: "guest" });
  const { t } = useTranslation();

  const userFeed = useDiscussionStore(_state => _state.getUserFeedDiscussions(state.order));
  const favouriteFeed = useDiscussionStore(_state => _state.getFavouriteFeedDiscussions(state.order));
  const guestFeed = useDiscussionStore(_state => _state.getGuestFeedDiscussions(state.order));

  const [userFeedProps, setUserFeedProps] = useFeedProps();
  const [favouriteFeedProps, setFavouriteFeedProps] = useFeedProps();
  const [guestFeedProps, setGuestFeedProps] = useFeedProps();

  const fetchUserFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (userFeedProps.loader) return;

    setUserFeedProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = useDiscussionStore.getState().getUserFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getUserDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (refresh) useDiscussionStore.setState(state => { state.userFeed = {} });
    if (discussions) useDiscussionStore.getState().addUserFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setUserFeedProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const fetchFavouriteFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (favouriteFeedProps.loader) return;

    setFavouriteFeedProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = useDiscussionStore.getState().getFavouriteFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getFavouriteDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (refresh) useDiscussionStore.setState(state => { state.favouriteFeed = {} });
    if (discussions) useDiscussionStore.getState().addFavouriteFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setFavouriteFeedProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const fetchGuestFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (guestFeedProps.loader) return;

    setGuestFeedProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = useDiscussionStore.getState().getGuestFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getGuestDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (refresh) useDiscussionStore.setState(state => { state.guestFeed = {} });
    if (discussions) useDiscussionStore.getState().addGuestFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setGuestFeedProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const fetcher = async (feed: typeof state.feed, refresh?: boolean) => {
    switch (feed) {
      case "user": await fetchUserFeed(state.order, refresh); break;
      case "favourite": await fetchFavouriteFeed(state.order, refresh); break;
      case "guest": await fetchGuestFeed(state.order, refresh); break;
    }
  }

  const getFeed = (feed: typeof state.feed) => {
    switch (feed) {
      case "user": return userFeed;
      case "favourite": return favouriteFeed;
      case "guest": return guestFeed;
    }
  }

  const changeFeed = (value: string) => {
    if (value === "user" || value === "favourite" || value === "guest") {
      setState(s => ({ ...s, feed: value }));
    }
  }

  const changeOrder = (value: string) => {
    if (value === "newer" || value === "older") {
      setState(s => ({ ...s, order: value }));

      // Clear feed when changing the order
      useDiscussionStore.setState(_state => {
        switch (state.feed) {
          case "user": _state.userFeed = {}; break;
          case "favourite": _state.favouriteFeed = {}; break;
          case "guest": _state.guestFeed = {}; break;
        }
      });
    }
  }

  const getLoader = (feed: typeof state.feed) => {
    switch (feed) {
      case "user": return userFeedProps.loader;
      case "favourite": return favouriteFeedProps.loader;
      case "guest": return guestFeedProps.loader;
    }
  }

  // Fetch if no discussions when changing feed or order
  // TODO: Fetch after sometime has passed
  useEffect(() => {
    getFeed(state.feed).length === 0 && fetcher(state.feed, false);
  }, [state.feed, state.order]);

  return (
    <>
      <CardPanel
        segments={[
          {
            value: state.feed,
            setValue: changeFeed,
            label: t("feed"),
            data: [
              { label: t("userFeed"), value: "user" },
              { label: t("favouriteFeed"), value: "favourite" },
              { label: t("guestFeed"), value: "guest" },
            ]
          },
          {
            value: state.order,
            setValue: changeOrder,
            label: t("order"),
            data: [
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]
          },
        ]}
      />

      <InfiniteScroll
        onTop={() => fetcher(state.feed, true)}
        onBottom={() => fetcher(state.feed, false)}
        loader={getLoader(state.feed)}
      >
        {getFeed(state.feed).map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
      </InfiniteScroll>
    </>
  )
}

export default Home