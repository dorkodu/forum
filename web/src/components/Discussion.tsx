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

  commentType: "newer" | "older";
  argumentType: "newer" | "older" | "top" | "bottom";

  argument: { text: string, type: boolean };
  comment: { text: string };
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
    action: { loading: false, status: undefined },

    show: "arguments",
    argumentType: "newer",
    commentType: "newer",

    argument: { text: "", type: true },
    comment: { text: "" },
  });

  const queryGetDiscussion = useDiscussionStore(state => state.queryGetDiscussion);
  const queryGetArguments = useDiscussionStore(state => state.queryGetArguments);
  const queryGetComments = useDiscussionStore(state => state.queryGetComments);
  const queryCreateArgument = useDiscussionStore(state => state.queryCreateArgument);
  const queryCreateComment = useDiscussionStore(state => state.queryCreateComment);

  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const comments = useDiscussionStore(_state => _state.getComments(discussionId, state.commentType));
  const _arguments = useDiscussionStore(_state => _state.getArguments(discussionId, state.argumentType));

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

  const getArguments = async (type: "newer" | "older" | "top" | "bottom", refresh?: boolean) => {
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryGetArguments(discussion.id, type, refresh);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  const getComments = async (type: "newer" | "older", refresh?: boolean) => {
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryGetComments(discussion.id, type, refresh);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

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
        {!state.loading && state.status && <>deleted...</>}
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
            <button onClick={() => setState({ ...state, commentType: "newer" })}>newer</button>
            <button onClick={() => setState({ ...state, commentType: "older" })}>older</button>
            &nbsp;
            <span>{state.commentType}</span>
            <br />
            <button onClick={() => getComments("older")}>load older</button>
            <button onClick={() => getComments("newer")}>load newer</button>
            <button onClick={() => getComments("newer", true)}>refresh</button>
          </>
        }
        {state.show === "arguments" &&
          <>
            <button onClick={() => setState({ ...state, argumentType: "newer" })}>newer</button>
            <button onClick={() => setState({ ...state, argumentType: "older" })}>older</button>
            <button onClick={() => setState({ ...state, argumentType: "top" })}>top</button>
            <button onClick={() => setState({ ...state, argumentType: "bottom" })}>bottom</button>
            &nbsp;
            <span>{state.argumentType}</span>
            <br />
            {(state.argumentType === "newer" || state.argumentType === "older") &&
              <>
                <button onClick={() => getArguments("older")}>load older</button>
                <button onClick={() => getArguments("newer")}>load newer</button>
              </>
            }
            <button onClick={() => getArguments(state.argumentType, true)}>refresh</button>
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

      {state.show === "arguments" && _arguments.map((argument) => <div key={argument.id}><hr /><Argument argumentId={argument.id} /></div>)}
      {state.show === "comments" && comments.map((comment) => <div key={comment.id}><hr /><Comment commentId={comment.id} /></div>)}
    </>
  )
}

export default Discussion