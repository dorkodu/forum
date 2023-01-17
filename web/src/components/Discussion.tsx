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

  show: "comments" | "arguments";
  time: "asc" | "desc";
  type: "any" | "positive" | "negative";
  votes: "any" | "most" | "least";

  comment: { text: string };
  argument: { text: string, type: "positive" | "negative" }
}

function Discussion({ discussionId }: Props) {
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

    show: "arguments",
    time: "desc",
    type: "any",
    votes: "most",
    comment: { text: "" },
    argument: { text: "", type: "positive" },
  });

  const queryGetDiscussion = useDiscussionStore(state => state.queryGetDiscussion);
  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));

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
        {discussion.title}
        <br />
        {discussion.title}
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
          <button onClick={() => setState({ ...state, argument: { ...state.argument, type: "positive" } })}>+</button>
          <button onClick={() => setState({ ...state, argument: { ...state.argument, type: "negative" } })}>-</button>
          &nbsp;
          <span>type: {state.argument.type}</span>
          <br />
          <button>send</button>
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
          <button>send</button>
        </>
      }

      {state.show === "arguments" && [...Array(5)].map((_v, i) => <div key={i}><hr /><Argument /></div>)}
      {state.show === "comments" && [...Array(5)].map((_v, i) => <div key={i}><hr /><Comment /></div>)}
    </>
  )
}

export default Discussion