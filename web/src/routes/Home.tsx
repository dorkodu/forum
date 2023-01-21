import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import DiscussionSummary from "../components/DiscussionSummary";
import { request, sage } from "../stores/api";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface State {
  loading: boolean;
  status: boolean | undefined;

  order: "newer" | "older";
  feed: "user" | "guest";
}


function Home() {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined, order: "newer", feed: "guest" }
  )

  const navigate = useNavigate();
  const userFeed = useDiscussionStore(_state => _state.getUserFeedDiscussions(state.order));
  const guestFeed = useDiscussionStore(_state => _state.getGuestFeedDiscussions(state.order));

  const fetchUserFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useDiscussionStore.getState().getUserFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getUserDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (discussions) useDiscussionStore.getState().setUserFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState({ ...state, loading: false, status: status });
  }

  const fetchGuestFeed = async (type: "newer" | "older", refresh?: boolean) => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });

    const anchorId = useDiscussionStore.getState().getGuestFeedAnchor(type, refresh);
    const res = await sage.get(
      {
        a: sage.query("getGuestDiscussionFeed", { anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )
    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const discussions = res?.a.data;
    const users = res?.b.data;

    if (discussions) useDiscussionStore.getState().setGuestFeedDiscussions(discussions);
    if (users) useUserStore.getState().setUsers(users);

    setState({ ...state, loading: false, status: status });
  }

  useEffect(() => { fetchGuestFeed("newer", true) }, [])

  return (
    <>
      <div>home</div>
      <button onClick={() => { navigate("/discussion-editor") }}>create discussion</button>

      <br />

      <button onClick={() => setState({ ...state, feed: "user" })}>user feed</button>
      <button onClick={() => setState({ ...state, feed: "guest" })}>guest feed</button>
      &nbsp;
      <span>{state.feed}</span>

      <br />

      <button onClick={() => setState({ ...state, order: "newer" })}>newer</button>
      <button onClick={() => setState({ ...state, order: "older" })}>older</button>
      &nbsp;
      <span>{state.order}</span>

      <br />

      {state.feed === "user" &&
        <>
          <button onClick={() => { fetchUserFeed("older") }}>load older</button>
          <button onClick={() => { fetchUserFeed("newer") }}>load newer</button>
          <button onClick={() => { fetchUserFeed("newer", true) }}>refresh</button>
        </>
      }

      {state.feed === "guest" &&
        <>
          <button onClick={() => { fetchGuestFeed("older") }}>load older</button>
          <button onClick={() => { fetchGuestFeed("newer") }}>load newer</button>
          <button onClick={() => { fetchGuestFeed("newer", true) }}>refresh</button>
        </>
      }

      {state.feed === "user" &&
        userFeed.map((discussion) => <div key={discussion.id}><hr /><DiscussionSummary discussionId={discussion.id} /></div>)
      }

      {state.feed === "guest" &&
        guestFeed.map((discussion) => <div key={discussion.id}><hr /><DiscussionSummary discussionId={discussion.id} /></div>)
      }
    </>
  )
}

export default Home