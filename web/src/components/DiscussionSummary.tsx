import { useNavigate } from "react-router-dom";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  discussionId: string | undefined;
}

function DiscussionSummary({ discussionId }: Props) {
  const navigate = useNavigate();

  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const user = useUserStore(state => state.getUserById(discussion?.userId));

  if (!discussion || !user) return (<></>)

  return (
    <>
      <div onClick={() => { navigate("/discussion/123") }}>
        <span>{user.name}</span>
        &nbsp;
        <span>@{user.username}</span>
        &nbsp;
        <span>{discussion.date}</span>
        <div>{discussion.title}</div>
        <div>
          <button onClick={(_ev) => { /* ev.stopPropagation(); setFavourite(!favourite); */ }}>
            {discussion.favourited ? "unfavourite" : "favourite"}
          </button>
          &nbsp;
          <span>favourites: {discussion.favouriteCount}</span>
          &nbsp;
          <span>arguments: {discussion.argumentCount}</span>
          &nbsp;
          <span>comments: {discussion.commentCount}</span>
          <br />
          <span>last update: {discussion.lastUpdateDate}</span>
          &nbsp;
          <span>last argument: {discussion.lastArgumentDate}</span>
          &nbsp;
          <span>last comment: {discussion.lastCommentDate}</span>
        </div>
      </div>
    </>
  )
}

export default DiscussionSummary