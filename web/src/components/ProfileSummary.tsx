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

function ProfileSummary({ user }: Props) {
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
      <div onClick={() => navigate(`/profile/${user.username}`)}>
        <span>{user.name}</span>
        &nbsp;
        <span>@{user.username}</span>
      </div>
      <div>{user.bio}</div>
      <div>
        <span>{user.followerCount} followers</span>
        &nbsp;
        <span>{user.followingCount} following</span>
        {user.id !== currentUserId &&
          <>
            &nbsp;
            <button onClick={followUser}>{user.follower ? "unfollow" : "follow"}</button>
          </>
        }
      </div>
    </>
  )
}

export default ProfileSummary