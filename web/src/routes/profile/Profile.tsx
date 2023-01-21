import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import DiscussionSummary from "../../components/DiscussionSummary";
import Profile from "../../components/Profile"
import { request, sage } from "../../stores/api";
import { useDiscussionStore } from "../../stores/discussionStore";
import { useUserStore } from "../../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  order: "newer" | "older";
}

function ProfileRoute() {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, order: "newer" }
  )

  const username = useParams<{ username: string }>().username;
  const user = useUserStore(state => state.getUserByUsername(username));
  const discussions = useDiscussionStore(_state => _state.getUserDiscussions(user?.id, state.order));

  const fetchDiscussions = async (type: "newer" | "older", refresh?: boolean) => {
    if (!user) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useDiscussionStore.getState().getUserDiscussionAnchor(user.id, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserDiscussions", { userId: user.id, type, anchorId }), },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error);
    const discussions = res?.a.data;

    if (discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    setState({ ...state, loading: false, status: status });
  }

  const fetchRoute = async (): Promise<boolean> => {
    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserDiscussions", { type: "newer", anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const discussions = res?.b.data;

    if (user) useUserStore.getState().setUsers([user]);
    if (user && discussions) useDiscussionStore.getState().setUserDiscussions(user.id, discussions);

    return status;
  }

  useEffect(() => {
    (async () => {
      setState({ ...state, loading: true, status: undefined });
      const status = await fetchRoute();
      setState({ ...state, loading: false, status: status });
    })()
  }, [])

  if (!user) {
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
        <button onClick={() => fetchDiscussions("older")}>load older</button>
        <button onClick={() => fetchDiscussions("newer")}>load newer</button>
        <button onClick={() => fetchDiscussions("newer", true)}>refresh</button>
      </div>

      {discussions.map((discussion) => <div key={discussion.id}><hr /><DiscussionSummary discussionId={discussion.id} /></div>)}
    </>
  )
}

export default ProfileRoute