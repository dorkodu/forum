import { IconArrowBigDownLine, IconArrowBigUpLine, IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CardPanel from "../components/cards/CardPanel";
import DiscussionSummary from "../components/DiscussionSummary";
import { useFeedProps, useWait } from "../components/hooks";
import { request, sage } from "../stores/api";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import InfiniteScroll from 'react-infinite-scroll-component';
import CardLoader from "../components/cards/CardLoader";

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
    if (userFeedProps.loading) return;

    setUserFeedProps(s => ({ ...s, loading: true, status: undefined }));

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

    if (discussions) useDiscussionStore.getState().addUserFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setUserFeedProps(s => ({
      ...s, loading: false, status: status, hasMore: discussions?.length !== 0
    }));
  }

  const fetchFavouriteFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (favouriteFeedProps.loading) return;

    setFavouriteFeedProps(s => ({ ...s, loading: true, status: undefined }));

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

    if (discussions) useDiscussionStore.getState().addFavouriteFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setFavouriteFeedProps(s => ({
      ...s, loading: false, status: status, hasMore: discussions?.length !== 0
    }));
  }

  const fetchGuestFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (guestFeedProps.loading) return;

    setGuestFeedProps(s => ({ ...s, loading: true, status: undefined }));

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

    if (discussions) useDiscussionStore.getState().addGuestFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setGuestFeedProps(s => ({
      ...s, loading: false, status: status, hasMore: discussions?.length !== 0
    }));
  }

  const refresh = async (feed: typeof state.feed) => {
    switch (feed) {
      case "user": await fetchUserFeed("newer", true); break;
      case "favourite": await fetchFavouriteFeed("newer", true); break;
      case "guest": await fetchGuestFeed("newer", true); break;
    }
  }

  const loadNewer = async () => {
    switch (state.feed) {
      case "user": await fetchUserFeed("newer"); break;
      case "favourite": await fetchFavouriteFeed("newer"); break;
      case "guest": await fetchGuestFeed("newer"); break;
    }
  }

  const loadOlder = async () => {
    switch (state.feed) {
      case "user": await fetchUserFeed("older"); break;
      case "favourite": await fetchFavouriteFeed("older"); break;
      case "guest": await fetchGuestFeed("older"); break;
    }
  }

  const feed = (feed: typeof state.feed) => {
    switch (feed) {
      case "user": return userFeed;
      case "favourite": return favouriteFeed;
      case "guest": return guestFeed;
    }
  }

  const changeFeed = (value: string) => {
    if (value === "user" || value === "favourite" || value === "guest") {
      setState(s => ({ ...s, feed: value }));
      if (feed(value).length === 0) refresh(value);
    }
  }

  const changeOrder = (value: string) => {
    if (value === "newer" || value === "older") {
      setState(s => ({ ...s, order: value }));
    }
  }

  const getHasMore = (feed: typeof state.feed) => {
    switch (feed) {
      case "user": return userFeedProps.hasMore;
      case "favourite": return favouriteFeedProps.hasMore;
      case "guest": return guestFeedProps.hasMore;
    }
  }

  // Don't fetch guest feed if there are already discussions fetched
  useEffect(() => { guestFeed.length === 0 && fetchGuestFeed("newer", true) }, []);

  return (
    <>
      <InfiniteScroll
        next={loadOlder}
        hasMore={getHasMore(state.feed)}
        loader={<CardLoader />}
        dataLength={feed(state.feed).length}

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
              value: state.order,
              setValue: changeOrder,
              label: t("order"),
              data: [
                { label: t("newer"), value: "newer" },
                { label: t("older"), value: "older" },
              ]
            },
          ]}

          buttons={[
            { onClick: () => refresh(state.feed), text: <IconRefresh /> },
            { onClick: loadOlder, text: <IconArrowBigDownLine /> },
            { onClick: loadNewer, text: <IconArrowBigUpLine /> },
          ]}
        />

        {feed(state.feed).map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
      </InfiniteScroll>

      {/*
      <InfiniteScroll
        onTop={loadNewer}
        onBottom={loadOlder}
        loaders={{ top: state.loader === "top", bottom: state.loader === "bottom", mid: state.loader === "mid", }}
      >
        {feed(state.feed).map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
      </InfiniteScroll>
      */}
    </>
  )
}

export default Home