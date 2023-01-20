import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import Profile from "../../components/Profile"
import ProfileSummary from "../../components/ProfileSummary"
import { request, sage } from "../../stores/api";
import { useUserStore } from "../../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  order: "newer" | "older";
}

function Following() {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, order: "newer" }
  )

  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const following = useUserStore(state => state.getUserFollowing(user));

  const fetchFollowing = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useUserStore.getState().getUserFollowingAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowing", { userId: user.id, type, anchorId }), },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error);
    const following = res?.a.data;

    if (following) useUserStore.getState().addUserFollowing(user, following);

    setState({ ...state, loading: false, status: status });
  }

  const fetchRoute = async (): Promise<boolean> => {
    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserFollowing", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const following = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (user && following) useUserStore.getState().addUserFollowing(user, following);

    return status;
  }

  useEffect(() => {
    (async () => {
      setState({ ...state, loading: true, status: undefined });
      const status = await fetchRoute();
      setState({ ...state, loading: false, status: status });
    })()
  }, [])

  if (!user || !following) {
    return (
      <>
        {state.loading && <>loading...</>}
        {state.status === false && <>fail...</>}
      </>
    )
  }

  return (
    <>
      <Profile user={user} />

      <hr />

      <div>
        <button onClick={() => setState({ ...state, order: "newer" })}>newer</button>
        <button onClick={() => setState({ ...state, order: "older" })}>older</button>
        &nbsp;
        <span>{state.order}</span>
      </div>
      <div>
        <button onClick={() => fetchFollowing("older")}>load older</button>
        <button onClick={() => fetchFollowing("newer")}>load newer</button>
        <button onClick={() => fetchFollowing("newer", true)}>refresh</button>
      </div>

      {following.map((_following) => <div key={_following.id}><hr /><ProfileSummary user={_following} /></div>)}
    </>
  )
}

export default Following