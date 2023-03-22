import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import CommentMenu from "./menus/CommentMenu";

interface Props {
  commentId: string;
}

function Comment({ commentId }: Props) {
  const comment = useDiscussionStore(state => state.getComment(commentId));
  const user = useUserStore(state => state.getUserById(comment?.userId));

  if (!comment || !user) return (<></>)

  return (
    <CardEntity
      user={user}
      entity={{
        content: comment.content,
        date: comment.date,
      }}

      componentMenu={<CommentMenu user={user} comment={comment} />}
    />
  )
}

export default Comment