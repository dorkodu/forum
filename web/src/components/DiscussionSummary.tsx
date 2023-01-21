import { useReducer } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  discussionId: string | undefined;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function DiscussionSummary({ discussionId }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const navigate = useNavigate();
  const location = useLocation();

  const queryFavouriteDiscussion = useDiscussionStore(state => state.queryFavouriteDiscussion);
  const queryDeleteDiscussion = useDiscussionStore(state => state.queryDeleteDiscussion);
  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const user = useUserStore(state => state.getUserById(discussion?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const gotoDiscussion = () => {
    if (!discussion) return;
    const target = `/discussion/${discussion.id}`;
    if (location.pathname !== target) navigate(target);
  }

  const gotoDiscussionEditor = () => {
    if (!discussion) return;
    navigate(`/discussion-editor/${discussion.id}`);
  }

  const favouriteDiscussion = async () => {
    if (!discussion) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFavouriteDiscussion(discussion);
    setState({ ...state, loading: false, status: status });
  }

  const deleteDiscussion = async () => {
    if (!discussion) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteDiscussion(discussion);
    setState({ ...state, loading: false, status: status });
  }

  if (!discussion || !user) return (<></>)

  return (
    <>
      <div onClick={gotoDiscussion}>
        <span>{user.name}</span>
        &nbsp;
        <span>@{user.username}</span>
        &nbsp;
        <span>{discussion.date}</span>
        {user.id === currentUserId &&
          <>
            &nbsp;
            <button onClick={(ev) => { ev.stopPropagation(); deleteDiscussion(); }}>delete</button>
            &nbsp;
            <button onClick={(ev) => { ev.stopPropagation(); gotoDiscussionEditor(); }}>edit</button>
          </>
        }
        <div>{discussion.title}</div>
        <div>
          <button onClick={(ev) => { ev.stopPropagation(); favouriteDiscussion(); }}>
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