import { IUser } from "@api/types/user";
import { useReducer } from "react";
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Profile({ user }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const navigate = useNavigate();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const currentUserId = useAuthStore(state => state.userId);

  const followUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <>
      <div>{user.name}</div>
      <div>@{user.username}</div>
      <div>{user.bio}</div>
      <div>{user.joinDate}</div>
      <div>
        <span onClick={() => navigate(`/profile/${user.username}/followers`)}>
          {user.followerCount} followers
        </span>
        &nbsp;
        <span onClick={() => navigate(`/profile/${user.username}/following`)}>
          {user.followingCount} following
        </span>
        {user.id !== currentUserId &&
          <>
            &nbsp;
            <button onClick={followUser}>un/follow</button>
          </>
        }
      </div>
    </>
  )
}

export default Profile