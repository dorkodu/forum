import { useEffect, useReducer } from "react"
import { useDiscussionStore } from "../stores/discussionStore";
import Argument from "./Argument";
import Comment from "./Comment"
import DiscussionSummary from "./DiscussionSummary";

interface Props {
  discussionId: string | undefined;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
  action: { loading: boolean, status: boolean | undefined };

  show: "comments" | "arguments";
  time: "asc" | "desc";
  type: "any" | "positive" | "negative";
  votes: "any" | "most" | "least";

  comment: { text: string };
  argument: { text: string, type: boolean }
}

function Discussion({ discussionId }: Props) {
  const queryGetDiscussion = useDiscussionStore(state => state.queryGetDiscussion);
  const queryGetComments = useDiscussionStore(state => state.queryGetComments);
  const queryCreateArgument = useDiscussionStore(state => state.queryCreateArgument);
  const queryCreateComment = useDiscussionStore(state => state.queryCreateComment);

  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const comments = useDiscussionStore(state => state.getComments(discussionId));

  const createArgument = async () => {
    if (state.argument.text.length === 0) return;
    if (state.argument.text.length > 500) return;
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryCreateArgument(discussion.id, state.argument.text, state.argument.type);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  const createComment = async () => {
    if (state.comment.text.length === 0) return;
    if (state.comment.text.length > 500) return;
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryCreateComment(discussion.id, state.comment.text);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  const getComments = async (type: "newer" | "older", refresh?: boolean) => {
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryGetComments(discussion.id, type, refresh);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  const [state, setState] = useReducer((prev: State, next: State) => {
    const newState = { ...prev, ...next };

    if (newState.comment.text.length > 500)
      newState.comment.text = newState.comment.text.substring(0, 500);

    if (newState.argument.text.length > 500)
      newState.argument.text = newState.argument.text.substring(0, 500);

    return newState;
  }, {
    loading: true,
    status: false,
    action: { loading: false, status: undefined },

    show: "arguments",
    time: "desc",
    type: "any",
    votes: "most",
    comment: { text: "" },
    argument: { text: "", type: true },
  });


  useEffect(() => {
    (async () => {
      setState({ ...state, loading: true, status: undefined });
      const status = await queryGetDiscussion(discussionId);
      setState({ ...state, loading: false, status: status });
    })()
  }, [])

  if (!discussion) {
    return (
      <>
        {state.loading && <>loading...</>}
        {state.status === false && <>fail...</>}
      </>
    )
  }

  return (
    <>
      <DiscussionSummary discussionId={discussionId} />

      <hr />

      <div>
        {discussion.readme}
      </div>

      <hr />

      <div>
        <button onClick={() => setState({ ...state, show: "comments" })}>show comments</button>
        <button onClick={() => setState({ ...state, show: "arguments" })}>show arguments</button>
        <br />
        {state.show === "comments" &&
          <>
            <button onClick={() => setState({ ...state, time: "asc" })}>time asc</button>
            <button onClick={() => setState({ ...state, time: "desc" })}>time desc</button>
            &nbsp;
            <span>{state.time}</span>
            <br />
            <button onClick={() => getComments("older")}>load older</button>
            <button onClick={() => getComments("newer")}>load newer</button>
            <button onClick={() => getComments("newer", true)}>refresh</button>
          </>
        }
        {state.show === "arguments" &&
          <>
            <button onClick={() => setState({ ...state, time: "asc" })}>time asc</button>
            <button onClick={() => setState({ ...state, time: "desc" })}>time desc</button>
            &nbsp;
            <span>{state.time}</span>
            <br />
            <button onClick={() => setState({ ...state, type: "any" })}>show all</button>
            <button onClick={() => setState({ ...state, type: "negative" })}>show positive</button>
            <button onClick={() => setState({ ...state, type: "positive" })}>show negative</button>
            &nbsp;
            <span>{state.type}</span>
            <br />
            <button onClick={() => setState({ ...state, votes: "any" })}>any votes</button>
            <button onClick={() => setState({ ...state, votes: "most" })}>most votes</button>
            <button onClick={() => setState({ ...state, votes: "least" })}>least votes</button>
            &nbsp;
            <span>{state.votes}</span>
          </>
        }
      </div>

      <hr />

      <div>showing {state.show}</div>

      <hr />

      {state.show === "arguments" &&
        <>
          <input
            type="text"
            placeholder="write argument..."
            defaultValue={state.argument.text}
            onChange={(ev) => setState({ ...state, argument: { ...state.argument, text: ev.target.value } })}
          />
          <button onClick={() => setState({ ...state, argument: { ...state.argument, type: true } })}>+</button>
          <button onClick={() => setState({ ...state, argument: { ...state.argument, type: false } })}>-</button>
          &nbsp;
          <span>type: {state.argument.type ? "positive" : "negative"}</span>
          <br />
          <button onClick={createArgument}>send</button>
        </>
      }
      {state.show === "comments" &&
        <>
          <input
            type="text"
            placeholder="write comment..."
            defaultValue={state.comment.text}
            onChange={(ev) => setState({ ...state, comment: { ...state.comment, text: ev.target.value } })}
          />
          <br />
          <button onClick={createComment}>send</button>
        </>
      }

      {state.show === "arguments" && [...Array(5)].map((_v, i) => <div key={i}><hr /><Argument /></div>)}
      {state.show === "comments" && comments.map((comment) => <div key={comment.id}><hr /><Comment commentId={comment.id} /></div>)}
    </>
  )
}

export default Discussion