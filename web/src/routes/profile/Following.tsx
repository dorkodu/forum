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

  following: {
    loading: boolean;
    status: boolean | undefined;
  }

  order: "newer" | "older";
  loader: "top" | "bottom" | "mid" | undefined;
}

function Following() {
  const [state, setState] = useState<State>({
    user: { loading: true, status: undefined },
    following: { loading: false, status: undefined },

    order: "newer",
    loader: undefined,
  });

  const { t } = useTranslation();
  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const following = useUserStore(state => state.getUserFollowing(user));

  const fetchFollowing = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;
    if (state.following.loading) return;

    setState(s => ({
      ...s, following: { ...s.following, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
    }));

    const anchorId = useUserStore.getState().getUserFollowingAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowing", { userId: user.id, type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const following = res?.a.data;

    if (following) useUserStore.getState().addUserFollowing(user, following);

    setState(s => ({
      ...s, following: { ...s.following, loading: false, status: status },
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
        b: sage.query("getUserFollowing", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const following = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (following) useUserStore.getState().setUsers(following);
    if (user && following) useUserStore.getState().addUserFollowing(user, following);

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
            label: t("followingOrder"),
            data: [
              { label: t("newer"), value: "newer" },
              { label: t("older"), value: "older" },
            ]
          },
        ]}

        buttons={[
          { onClick: () => fetchFollowing("newer", true), text: <IconRefresh /> },
          { onClick: () => fetchFollowing("newer"), text: <IconArrowBigDownLine /> },
          { onClick: () => fetchFollowing("older"), text: <IconArrowBigUpLine /> },
        ]}
      />

      <InfiniteScroll
        onTop={() => fetchFollowing("newer")}
        onBottom={() => fetchFollowing("older")}
        loaders={{ top: state.loader === "top", bottom: state.loader === "bottom", mid: state.loader === "mid" }}
      >
        {following.map((_following) => <ProfileSummary key={_following.id} user={_following} />)}
      </InfiniteScroll>
    </>
  )
}

export default Following