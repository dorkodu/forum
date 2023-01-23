import { IUser } from "@api/types/user";
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
      <input
        type="text"
        placeholder="search @username or user"
        disabled={state.loading}
        onChange={(ev) => { setState({ ...state, search: ev.target.value }) }}
      />

      <div>
        <button onClick={() => fetchUsers("older")}>load older</button>
        <button onClick={() => fetchUsers("newer")}>load newer</button>
        <button onClick={() => fetchUsers("newer", true)}>refresh</button>
      </div>

      {users.map((user) => <div key={user.id}><hr /><ProfileSummary user={user} /></div>)}
    </>
  )
}

export default Search