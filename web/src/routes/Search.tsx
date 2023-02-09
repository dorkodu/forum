import { Card, TextInput } from "@mantine/core";
import { IconArrowBigDownLine, IconArrowBigUpLine, IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CardPanel } from "../components/cards/CardPanel";
import { useWait } from "../components/hooks";
import InfiniteScroll from "../components/InfiniteScroll";
import ProfileSummary from "../components/ProfileSummary";
import { array } from "../lib/array";
import { request, sage } from "../stores/api";
import { useUserStore } from "../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  search: string;
  loader: "top" | "bottom" | "mid" | undefined;
}

function Search() {
  const { t } = useTranslation();
  const users = useUserStore(state => state.getSearchUsers());

  const getSorted = () => {
    return array.sort(users, "joinDate", ((a, b) => a - b));
  }

  const getAnchor = (type: "newer" | "older", refresh?: boolean) => {
    return array.getAnchor(getSorted(), "id", "-1", type, refresh);
  }

  const [state, setState] = useState<State>({
    loading: false, status: undefined, search: "", loader: undefined,
  });

  const fetchUsers = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;

    setState(s => ({
      ...s, loading: true, status: undefined,
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
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

    if (users) useUserStore.getState().setSearchUsers(users, refresh);

    setState(s => ({ ...s, loading: false, status: status, loader: undefined }));
  }

  useEffect(() => {
    if (state.search === "" || state.search === "@") {
      useUserStore.getState().setSearchUsers([], true);
      return;
    }

    const timeout = setTimeout(() => { fetchUsers("newer", true) }, 1000);
    return () => { clearTimeout(timeout) };
  }, [state.search])

  return (
    <>
      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <TextInput
          radius="md"
          label={t("searchUserLabel")}
          description={t("searchUserDescription")}
          placeholder={t("searchUser")}
          defaultValue={state.search}
          onChange={(ev) => { setState(s => ({ ...s, search: ev.target.value })) }}
          pb="md"
        />

        <CardPanel.Buttons
          buttons={[
            { text: t("refresh"), onClick: () => fetchUsers("newer", true), icon: <IconRefresh /> },
            { text: t("loadOlder"), onClick: () => fetchUsers("newer"), icon: <IconArrowBigDownLine /> },
            { text: t("loadNewer"), onClick: () => fetchUsers("older"), icon: <IconArrowBigUpLine /> },
          ]}
        />
      </Card>

      <InfiniteScroll
        onTop={() => fetchUsers("newer")}
        onBottom={() => fetchUsers("older")}
        loaders={{ top: state.loader === "top", bottom: state.loader === "bottom", mid: state.loader === "mid", }}
      >
        {users.map((user) => <ProfileSummary key={user.id} user={user} />)}
      </InfiniteScroll>
    </>
  )
}

export default Search