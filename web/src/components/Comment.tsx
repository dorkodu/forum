import { useReducer } from "react";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  commentId: string;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Comment({ commentId }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const queryDeleteComment = useDiscussionStore(state => state.queryDeleteComment);

  const comment = useDiscussionStore(state => state.getComment(commentId));
  const user = useUserStore(state => state.getUserById(comment?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const deleteComment = async () => {
    if (!comment) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteComment(comment);
    setState({ ...state, loading: false, status: status });
  }

  if (!comment || !user) return (<></>)

  return (
    <>
      <div>
        <span>{user.name}</span>
        &nbsp;
        <span>@{user.username}</span>
        &nbsp;
        <span>{comment.date}</span>
        {user.id === currentUserId &&
          <>
            &nbsp;
            <button onClick={deleteComment}>delete</button>
          </>
        }
      </div>
      <div>{comment.content}</div>
    </>
  )
}

export default Comment