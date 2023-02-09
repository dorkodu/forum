import { IconArrowBigDownLine, IconArrowBigUpLine, IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CardPanel from "../components/cards/CardPanel";
import DiscussionSummary from "../components/DiscussionSummary";
import { useWait } from "../components/hooks";
import InfiniteScroll from "../components/InfiniteScroll";
import { request, sage } from "../stores/api";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface State {
  user: {
    loading: boolean;
    status: boolean | undefined;
  }

  favourite: {
    loading: boolean;
    status: boolean | undefined;
  }

  guest: {
    loading: boolean;
    status: boolean | undefined;
  }

  loader: "top" | "bottom" | "mid" | undefined;

  order: "newer" | "older";
  feed: "user" | "favourite" | "guest";
}

function Home() {
  const [state, setState] = useState<State>(
    {
      user: { loading: false, status: undefined },
      favourite: { loading: false, status: undefined },
      guest: { loading: false, status: undefined },
      loader: "mid",
      order: "newer",
      feed: "guest",
    }
  );
  const { t } = useTranslation();
  const userFeed = useDiscussionStore(_state => _state.getUserFeedDiscussions(state.order));
  const favouriteFeed = useDiscussionStore(_state => _state.getFavouriteFeedDiscussions(state.order));
  const guestFeed = useDiscussionStore(_state => _state.getGuestFeedDiscussions(state.order));

  const fetchUserFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.user.loading) return;

    setState(s => ({
      ...s,
      user: { ...s.user, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
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

    if (discussions) useDiscussionStore.getState().addUserFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState(s => ({ ...s, user: { ...s.user, loading: false, status: status }, loader: undefined }));
  }

  const fetchFavouriteFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.favourite.loading) return;

    setState(s => ({
      ...s,
      favourite: { ...s.favourite, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
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

    if (discussions) useDiscussionStore.getState().addFavouriteFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState(s => ({ ...s, favourite: { ...s.favourite, loading: false, status: status }, loader: undefined }));
  }

  const fetchGuestFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.guest.loading) return;

    setState(s => ({
      ...s,
      guest: { ...s.guest, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
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

    if (discussions) useDiscussionStore.getState().addGuestFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState(s => ({ ...s, guest: { ...s.guest, loading: false, status: status }, loader: undefined }));
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

  useEffect(() => { fetchGuestFeed("newer", true) }, []);

  return (
    <>
      <CardPanel
        segments={[
          {
            value: state.feed,
            setValue: changeFeed,
            data: [
              { label: t("userFeed"), value: "user" },
              { label: t("favouriteFeed"), value: "favourite" },
              { label: t("guestFeed"), value: "guest" },
            ]
          },
          {
            value: state.order,
            setValue: changeOrder,
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

      <InfiniteScroll
        onTop={loadNewer}
        onBottom={loadOlder}
        loaders={{ top: state.loader === "top", bottom: state.loader === "bottom", mid: state.loader === "mid", }}
      >
        {feed(state.feed).map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
      </InfiniteScroll>
    </>
  )
}

export default Home