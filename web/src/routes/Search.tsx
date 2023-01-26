import { IUser } from "@api/types/user";
import { Button, Card, TextInput } from "@mantine/core";
import { useEffect, useMemo, useReducer } from "react";
import ProfileSummary from "../components/ProfileSummary";
import { array } from "../lib/array";
import { request, sage } from "../stores/api";

interface State {
  loading: boolean;
  status: boolean | undefined;

  search: string;
  users: IUser[];
}

function Search() {
  const getSorted = () => {
    return array.sort(state.users, "joinDate", ((a, b) => a - b));
  }

  const getAnchor = (type: "newer" | "older", refresh?: boolean) => {
    return array.getAnchor(getSorted(), "id", "-1", type, refresh);
  }

  const [state, setState] = useReducer(
    (prev: State, next: State) => {
      const newState = { ...prev, ...next };
      if (newState.search === "" || newState.search === "@") newState.users = [];
      return newState;
    },
    { loading: false, status: undefined, search: "", users: [] }
  );

  const users = useMemo(() => getSorted(), [state.users]);

  const fetchUsers = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;
    if (refresh) setState({ ...state, users: [] });

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

    setState({
      ...state,
      loading: false,
      status: status,
      users: refresh && users ? users : users ? [...state.users, ...users] : state.users
    });
  }

  useEffect(() => {
    if (state.search === "" || state.search === "@") return;
    const timeout = setTimeout(() => { fetchUsers("newer", true) }, 1000);
    return () => { clearTimeout(timeout) };
  }, [state.search])

  return (
    <>
      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <TextInput
          radius="md"
          placeholder="search @username or user..."
          defaultValue={state.search}
          onChange={(ev) => { setState({ ...state, search: ev.target.value }) }}
          pb="md"
        />

        <Button.Group >
          <Button radius="md" fullWidth variant="default" onClick={() => fetchUsers("newer", true)}>refresh</Button>
          <Button radius="md" fullWidth variant="default" onClick={() => fetchUsers("newer")}>load newer</Button>
          <Button radius="md" fullWidth variant="default" onClick={() => fetchUsers("older")}>load older</Button>
        </Button.Group>
      </Card>

      {users.map((user) => <ProfileSummary key={user.id} user={user} />)}
    </>
  )
}

export default Search