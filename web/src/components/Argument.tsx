import { useReducer } from "react"
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  argumentId: string;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Argument({ argumentId }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const queryVoteArgument = useDiscussionStore(state => state.queryVoteArgument);
  const queryDeleteArgument = useDiscussionStore(state => state.queryDeleteArgument);

  const argument = useDiscussionStore(state => state.getArgument(argumentId));
  const user = useUserStore(state => state.getUserById(argument?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const voteArgument = async (type: boolean) => {
    if (!argument) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryVoteArgument(argument, type);
    setState({ ...state, loading: false, status: status });
  }

  const deleteArgument = async () => {
    if (!argument) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteArgument(argument);
    setState({ ...state, loading: false, status: status });
  }

  if (!argument || !user) return (<></>)

  return (
    <>
      <div>
        <span>{user.name}</span>
        &nbsp;
        <span>@{user.username}</span>
        &nbsp;
        <span>{argument.date}</span>
        {user.id === currentUserId &&
          <>
            &nbsp;
            <button onClick={deleteArgument}>delete</button>
          </>
        }
      </div>
      <div>{argument.content}</div>
      <div>
        <span>type: {argument.type ? "+" : "-"}</span>
        &nbsp;
        <span>votes: {argument.voteCount}</span>
        &nbsp;
        <button onClick={() => voteArgument(true)}>upvote</button>
        <button onClick={() => voteArgument(false)}>downvote</button>
        &nbsp;
        <span>{!argument.voted ? "none" : argument.votedType ? "up" : "down"}</span>
      </div>
    </>
  )
}

export default Argument