import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CardPanel from "../components/cards/CardPanel";
import DiscussionSummary from "../components/DiscussionSummary";
import { useFeedProps, useWait } from "../components/hooks";
import { request, sage } from "../stores/api";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { useAppStore } from "../stores/appStore";
import InfiniteScroll from "../components/InfiniteScroll";

function Home() {
  const { t } = useTranslation();

  const state = useAppStore(state => state.options.home);
  const userFeed = useDiscussionStore(_state => _state.getUserFeedDiscussions(state.userOrder));
  const favouriteFeed = useDiscussionStore(_state => _state.getFavouriteFeedDiscussions(state.favouriteOrder));
  const guestFeed = useDiscussionStore(_state => _state.getGuestFeedDiscussions(state.guestOrder));

  const [userFeedProps, setUserFeedProps] = useFeedProps();
  const [favouriteFeedProps, setFavouriteFeedProps] = useFeedProps();
  const [guestFeedProps, setGuestFeedProps] = useFeedProps();

  const fetchUserFeed = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!skipWaiting && userFeedProps.loader) return;

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

    setUserFeedProps(s => ({
      ...s, loader: undefined, status, hasMore: discussions?.length !== 0
    }));
  }

  const fetchFavouriteFeed = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!skipWaiting && favouriteFeedProps.loader) return;

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

    setFavouriteFeedProps(s => ({
      ...s, loader: undefined, status, hasMore: discussions?.length !== 0
    }));
  }

  const fetchGuestFeed = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!skipWaiting && guestFeedProps.loader) return;

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

    setGuestFeedProps(s => ({
      ...s, loader: undefined, status, hasMore: discussions?.length !== 0
    }));
  }

  const fetcher = async (feed: typeof state.feed, refresh?: boolean, skipWaiting?: boolean) => {
    switch (feed) {
      case "user": await fetchUserFeed(state.userOrder, refresh, skipWaiting); break;
      case "favourite": await fetchFavouriteFeed(state.favouriteOrder, refresh, skipWaiting); break;
      case "guest": await fetchGuestFeed(state.guestOrder, refresh, skipWaiting); break;
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
      useAppStore.setState(s => { s.options.home.feed = value });
    }
  }

  const getOrder = () => {
    switch (state.feed) {
      case "user": return state.userOrder;
      case "favourite": return state.favouriteOrder;
      case "guest": return state.guestOrder;
    }
  }

  const changeOrder = (value: string) => {
    /**
     * Can't change feed order if the current feed is loading.
     * It fixes a bug which occurs when user changed order very fast,
     * for ex. changes newer -> older -> newer, then the feed will show,
     * older posts in newer order, which not the desired outcome.
     */
    if (getLoader(state.feed)) return;

    if (value === "newer" || value === "older") {
      useAppStore.setState(s => {
        switch (state.feed) {
          case "user": s.options.home.userOrder = value; break;
          case "favourite": s.options.home.favouriteOrder = value; break;
          case "guest": s.options.home.guestOrder = value; break;
        }
      });

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

  const getHasMore = (feed: typeof state.feed) => {
    switch (feed) {
      case "user": return userFeedProps.hasMore;
      case "favourite": return favouriteFeedProps.hasMore;
      case "guest": return guestFeedProps.hasMore;
    }
  }

  // Fetch if no discussions when changing feed or order
  // TODO: Fetch after sometime has passed
  useEffect(() => {
    getFeed(state.feed).length === 0 && fetcher(state.feed, false);
  }, [state.feed, state.userOrder, state.favouriteOrder, state.guestOrder]);

  return (
    <InfiniteScroll
      refresh={() => fetcher(state.feed, true)}
      next={() => fetcher(state.feed, false, true)}
      length={getFeed(state.feed).length}
      hasMore={getHasMore(state.feed)}
    >
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
            value: getOrder(),
            setValue: changeOrder,
            label: t("order"),
            data: [
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]
          },
        ]}
      />

      {getFeed(state.feed).map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
    </InfiniteScroll>
  )
}

export default Home