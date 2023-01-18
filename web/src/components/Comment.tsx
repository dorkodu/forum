import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  commentId: string;
}

function Comment({ commentId }: Props) {

  const comment = useDiscussionStore(state => state.getComment(commentId));
  const user = useUserStore(state => state.getUserById(comment?.userId));

  if (!comment || !user) return (<></>)

  return (
    <>
      <div>
        <span>{user.name}</span>
        &nbsp;
        <span>@{user.username}</span>
        &nbsp;
        <span>{comment.date}</span>
      </div>
      <div>{comment.content}</div>
    </>
  )
}

export default Comment