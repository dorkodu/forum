import { IconArrowBigDownLine, IconArrowBigUpLine, IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import CardAlert from "../../components/cards/CardAlert";
import CardLoader from "../../components/cards/CardLoader";
import CardPanel from "../../components/cards/CardPanel";
import { useWait } from "../../components/hooks";
import InfiniteScroll from "../../components/InfiniteScroll";
import Profile from "../../components/Profile"
import ProfileSummary from "../../components/ProfileSummary"
import { request, sage } from "../../stores/api";
import { useUserStore } from "../../stores/userStore";

interface State {
  user: {
    loading: boolean;
    status: boolean | undefined;

  }

  followers: {
    loading: boolean;
    status: boolean | undefined;
  }

  order: "newer" | "older";
  loader: "top" | "bottom" | "mid" | undefined;
}

function Follower() {
  const [state, setState] = useState<State>({
    user: { loading: true, status: undefined },
    followers: { loading: false, status: undefined },

    order: "newer",
    loader: undefined,
  });

  const { t } = useTranslation();
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const followers = useUserStore(state => state.getUserFollowers(user));

  const fetchFollowers = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;
    if (state.followers.loading) return;

    setState(s => ({
      ...s, followers: { ...s.followers, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
    }));

    const anchorId = useUserStore.getState().getUserFollowersAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowers", { userId: user.id, type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const followers = res?.a.data;

    if (followers) useUserStore.getState().addUserFollowers(user, followers);

    setState(s => ({
      ...s, followers: { ...s.followers, loading: false, status: status },
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
        b: sage.query("getUserFollowers", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const followers = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (followers) useUserStore.getState().setUsers(followers);
    if (user && followers) useUserStore.getState().addUserFollowers(user, followers);

    setState(s => ({
      ...s, user: { ...s.user, loading: false, status: status },
      loader: undefined
    }));
  }

  const changeOrder = (value: string) => {
    if (value === "newer" || value === "older") {
      setState(s => ({ ...s, order: value }));
    }
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

      <CardPanel
        segments={[
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
          { onClick: () => fetchFollowers("newer", true), text: <IconRefresh /> },
          { onClick: () => fetchFollowers("newer"), text: <IconArrowBigDownLine /> },
          { onClick: () => fetchFollowers("older"), text: <IconArrowBigUpLine /> },
        ]}
      />

      <InfiniteScroll
        onTop={() => fetchFollowers("newer")}
        onBottom={() => fetchFollowers("older")}
        loaders={{ top: state.loader === "top", bottom: state.loader === "bottom", mid: state.loader === "mid" }}
      >
        {followers.map((follower) => <ProfileSummary key={follower.id} user={follower} />)}
      </InfiniteScroll>
    </>
  )
}

export default Follower