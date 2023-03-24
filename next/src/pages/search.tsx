import { Card, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { CardPanel } from "../components/cards/CardPanel";
import { useFeedProps, wait } from "../components/hooks";
import InfiniteScroll from "../components/InfiniteScroll";
import ProfileSummary from "../components/ProfileSummary";
import { array } from "@/lib/web/array";
import { util } from "@/lib/web/util";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useUserStore } from "../stores/userStore";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function Search() {
  const router = useRouter();
  const { t } = useTranslation();

  const [initial, setInitial] = useState(true);
  const state = useAppStore(state => state.options.search);
  const users = useUserStore(_state => _state.getSearchUsers(state.order));

  const [searchFeedProps, setSearchFeedProps] = useFeedProps();

  const getSorted = (type: "newer" | "older") => {
    return array.sort(users, "id", ((a, b) => util.compareId(a, b, type === "newer")));
  }

  const getAnchor = (type: "newer" | "older", refresh?: boolean) => {
    return array.getAnchor(getSorted("newer"), "id", "-1", type, refresh);
  }

  const fetchUsers = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!skipWaiting && searchFeedProps.loading) return;

    const name = state.search.startsWith("@") ? undefined : state.search;
    const username = state.search.startsWith("@") ? state.search.substring(1) : undefined;
    if (!name && !username) return;

    setSearchFeedProps(s => ({ ...s, loading: true, status: undefined }));

    const anchorId = getAnchor(type, refresh);
    const res = await sage.get(
      { a: sage.query("searchUser", { name, username, anchorId, type }), },
      (query) => wait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const users = res?.a.data;

    if (refresh) useUserStore.getState().addSearchUsers([], true);
    if (users) {
      useUserStore.getState().setUsers(users);
      useUserStore.getState().addSearchUsers(users, refresh);
    }

    setSearchFeedProps(s => ({ ...s, loading: false, status, hasMore: users?.length !== 0 }));
  }

  const changeOrder = (value: string) => {
    // See /routes/Home.tsx for explanation
    if (searchFeedProps.loading) return;

    if (value === "newer" || value === "older") {
      useAppStore.setState(s => { s.options.search.order = value });

      // Clear feed when changing the order
      useUserStore.getState().addSearchUsers([], true);
      fetchUsers(state.order, true);
    }
  }

  useEffect(() => {
    const u = typeof router.query.u === "string" ? router.query.u : undefined;

    // On initial render, use the query param from url if exists
    if (initial) {
      if (u && u !== "") {
        useAppStore.setState(s => { s.options.search.search = u });
        fetchUsers(state.order, true);
      }

      setInitial(false);
      return;
    }

    // If search input is empty, clear results & params in url
    if (state.search === "" || state.search === "@") {
      useUserStore.getState().addSearchUsers([], true);
      router.replace({ query: {} });
      return;
    }

    // Wait 1 second, then change url param & fetch users
    const timeout = setTimeout(() => {
      router.replace({ query: { u: state.search } });
      fetchUsers(state.order, true);
    }, 1000);
    return () => { clearTimeout(timeout) };
  }, [state.search])

  return (
    <InfiniteScroll
      refresh={() => fetchUsers(state.order, true)}
      next={() => fetchUsers(state.order, false, true)}
      hasMore={searchFeedProps.hasMore}
    >
      <Card shadow="sm" p="md" m="md" radius="md" withBorder>
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

      {getSorted(state.order).map((user) => <ProfileSummary key={user.id} user={user} />)}
    </InfiniteScroll>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}