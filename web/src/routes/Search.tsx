import { Card, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { CardPanel } from "../components/cards/CardPanel";
import { useFeedProps, useWait } from "../components/hooks";
import InfiniteScroll from "../components/InfiniteScroll";
import ProfileSummary from "../components/ProfileSummary";
import { array } from "../lib/array";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useUserStore } from "../stores/userStore";

function Search() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useAppStore(state => state.options.search);
  const users = useUserStore(state => state.getSearchUsers());

  const [searchFeedProps, setSearchFeedProps] = useFeedProps();

  const getSorted = (type: "newer" | "older") => {
    return array.sort(
      users,
      "joinDate",
      type === "newer" ? ((a, b) => a - b) : ((a, b) => b - a)
    );
  }

  const getAnchor = (type: "newer" | "older", refresh?: boolean) => {
    return array.getAnchor(getSorted("newer"), "id", "-1", type, refresh);
  }

  const fetchUsers = async (type: "newer" | "older", refresh?: boolean) => {
    if (searchFeedProps.loader) return;

    const name = state.search.startsWith("@") ? undefined : state.search;
    const username = state.search.startsWith("@") ? state.search.substring(1) : undefined;
    if (!name && !username) return;

    setSearchFeedProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = getAnchor(type, refresh);
    const res = await sage.get(
      { a: sage.query("searchUser", { name, username, anchorId, type }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const users = res?.a.data;

    if (refresh) useUserStore.getState().setSearchUsers([], true);
    if (users) useUserStore.getState().setSearchUsers(users, refresh);

    setSearchFeedProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const changeOrder = (value: string) => {
    if (value === "newer" || value === "older") {
      useAppStore.setState(s => { s.options.search.order = value });

      // Clear feed when changing the order
      useUserStore.getState().setSearchUsers([], true);
      fetchUsers(state.order, true);
    }
  }

  useEffect(() => {
    const u = searchParams.get("u");
    if (state.search === "" && u && u !== "") {
      useAppStore.setState(s => { s.options.search.search = u });
    }

    if (state.search === "" || state.search === "@") {
      useUserStore.getState().setSearchUsers([], true);
      return;
    }

    const timeout = setTimeout(() => {
      setSearchParams({ u: state.search });
      fetchUsers(state.order, true);
    }, 1000);
    return () => { clearTimeout(timeout) };
  }, [state.search])

  return (
    <>
      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <TextInput
          radius="md"
          label={t("user.searchLabel")}
          description={t("user.searchDescription")}
          placeholder={t("user.search")}
          defaultValue={state.search}
          onChange={ev => useAppStore.setState(s => { s.options.search.search = ev.target.value })}
          pb="md"
        />

        <CardPanel.Segments
          segments={
            [{
              value: state.order,
              setValue: changeOrder,
              label: t("order"),
              data: [
                { label: t("newer"), value: "newer" },
                { label: t("older"), value: "older" },
              ]
            }]
          }
        />
      </Card>

      <InfiniteScroll
        onTop={() => fetchUsers(state.order, true)}
        onBottom={() => fetchUsers(state.order, false)}
        loader={searchFeedProps.loader}
      >
        {getSorted(state.order).map((user) => <ProfileSummary key={user.id} user={user} />)}
      </InfiniteScroll>
    </>
  )
}

export default Search