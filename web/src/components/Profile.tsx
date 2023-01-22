import { IUser } from "@api/types/user";
import { useReducer } from "react";
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  user: IUser;
}

interface State {
  name: string;
  bio: string;

  editing: boolean;

  loading: boolean;
  status: boolean | undefined;
}

function Profile({ user }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => {
      const newState = { ...prev, ...next };

      if (newState.name.length > 64)
        newState.name = newState.name.substring(0, 64);

      if (newState.bio.length > 500)
        newState.bio = newState.bio.substring(0, 500);

      return newState;
    },
    { name: "", bio: "", editing: false, loading: false, status: undefined }
  )

  const navigate = useNavigate();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const queryEditUser = useUserStore(state => state.queryEditUser);
  const currentUserId = useAuthStore(state => state.userId);

  const followUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  const editUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryEditUser(state.name, state.bio);
    setState({ ...state, loading: false, status: status });
  }

  const startEdit = () => {
    setState({ ...state, name: user.name, bio: user.bio, editing: true })
  }

  const stopEdit = async (saveChanges: boolean) => {
    if (saveChanges) await editUser();
    setState({ ...state, editing: false });
  }

  return (
    <>
      <div>
        {state.editing &&
          <input
            type="text"
            placeholder="name"
            disabled={state.loading}
            defaultValue={state.name}
            onChange={(ev) => { setState({ ...state, name: ev.target.value }) }}
          />
        }
        {!state.editing && <>{user.name}</>}
      </div>

      <div>@{user.username}</div>

      <div>
        {state.editing &&
          <input
            type="text"
            placeholder="bio"
            disabled={state.loading}
            defaultValue={state.bio}
            onChange={(ev) => { setState({ ...state, bio: ev.target.value }) }}
          />
        }
        {!state.editing && <>{user.bio}</>}
      </div>

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
            <button onClick={followUser}>{user.follower ? "unfollow" : "follow"}</button>
          </>
        }

        {user.following && <>&nbsp;follows you</>}

        {user.id === currentUserId && !state.editing &&
          <>
            &nbsp;
            <button onClick={startEdit}>edit</button>
          </>
        }
        {user.id === currentUserId && state.editing &&
          <>
            &nbsp;
            <button onClick={() => stopEdit(false)}>cancel</button>
            &nbsp;
            <button onClick={() => stopEdit(true)}>confirm</button>
          </>
        }

      </div>
    </>
  )
}

export default Profile