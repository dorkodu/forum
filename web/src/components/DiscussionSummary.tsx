import { useNavigate } from "react-router-dom";
import { useDiscussionStore } from "../stores/discussionStore";

interface Props {
  discussionId: string | undefined;
}

function DiscussionSummary({ discussionId }: Props) {
  const navigate = useNavigate();

  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));

  if (!discussion) return (<></>)

  return (
    <>
      <div onClick={() => { navigate("/discussion/123") }}>
        <span>Berk Cambaz</span>
        &nbsp;
        <span>@berkcambaz</span>
        &nbsp;
        <span>16h</span>
        <div>{discussion.title}</div>
        <div>
          <button onClick={(ev) => { /* ev.stopPropagation(); setFavourite(!favourite); */ }}>
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