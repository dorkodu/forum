import { Button, Card, TextInput } from "@mantine/core";
import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import ProfileSummary from "../components/ProfileSummary";
import { array } from "../lib/array";
import { request, sage } from "../stores/api";
import { useUserStore } from "../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  search: string;
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

  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, search: "" }
  );

  const fetchUsers = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });

    const name = state.search.startsWith("@") ? undefined : state.search;
    const username = state.search.startsWith("@") ? state.search.substring(1) : undefined;

    const anchorId = getAnchor(type, refresh);
    const res = await sage.get(
      { a: sage.query("searchUser", { name, username, anchorId, type }), },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error);
    const users = res?.a.data;

    if (users) useUserStore.getState().setSearchUsers(users, refresh);

    setState({ ...state, loading: false, status: status });
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
          placeholder={t("searchUser")}
          defaultValue={state.search}
          onChange={(ev) => { setState({ ...state, search: ev.target.value }) }}
          pb="md"
        />

        <Button.Group >
          <Button radius="md" fullWidth variant="default" onClick={() => fetchUsers("newer", true)}>{t("refresh")}</Button>
          <Button radius="md" fullWidth variant="default" onClick={() => fetchUsers("newer")}>{t("loadNewer")}</Button>
          <Button radius="md" fullWidth variant="default" onClick={() => fetchUsers("older")}>{t("loadOlder")}</Button>
        </Button.Group>
      </Card>

      {users.map((user) => <ProfileSummary key={user.id} user={user} />)}
    </>
  )
}

export default Search