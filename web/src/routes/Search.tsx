import { Card, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CardPanel } from "../components/cards/CardPanel";
import { useFeedProps, useWait } from "../components/hooks";
import InfiniteScroll from "../components/InfiniteScroll";
import ProfileSummary from "../components/ProfileSummary";
import { array } from "../lib/array";
import { request, sage } from "../stores/api";
import { useUserStore } from "../stores/userStore";

interface State {
  search: string;
  order: "newer" | "older";
}

function Search() {
  // By default, order is older to give advantage to older users
  const [state, setState] = useState<State>({ search: "", order: "older" });

  const { t } = useTranslation();
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
    return array.getAnchor(getSorted(type), "id", "-1", type, refresh);
  }

  const fetchUsers = async (type: "newer" | "older", refresh?: boolean) => {
    if (searchFeedProps.loader) return;

    setSearchFeedProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const name = state.search.startsWith("@") ? undefined : state.search;
    const username = state.search.startsWith("@") ? state.search.substring(1) : undefined;

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
      setState(s => ({ ...s, order: value }));

      // Clear feed when changing the order
      useUserStore.getState().setSearchUsers([], true);
      fetchUsers(state.order, true);
    }
  }

  useEffect(() => {
    if (state.search === "" || state.search === "@") {
      useUserStore.getState().setSearchUsers([], true);
      return;
    }

    const timeout = setTimeout(() => { fetchUsers(state.order, true) }, 1000);
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
          onChange={(ev) => { setState(s => ({ ...s, search: ev.target.value })) }}
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