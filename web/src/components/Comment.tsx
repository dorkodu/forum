import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import CommentMenu from "./menus/CommentMenu";

interface Props {
  commentId: string;
}

function Comment({ commentId }: Props) {
  const navigate = useNavigate();
  const comment = useDiscussionStore(state => state.getComment(commentId));
  const user = useUserStore(state => state.getUserById(comment?.userId));

  const gotoUser = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!user) return;
    navigate(`/profile/${user.username}`);
  }

  if (!comment || !user) return (<></>)

  return (
    <CardEntity
      user={user}
      entity={{
        content: comment.content,
        date: comment.date,
      }}

      onClickUser={gotoUser}

      componentMenu={<CommentMenu user={user} comment={comment} />}
    />
  )
}

export default Comment