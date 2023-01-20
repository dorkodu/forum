import { IUser } from "@api/types/user";
import { useNavigate } from "react-router-dom"

interface Props {
  user: IUser;
}

function Profile({ user }: Props) {
  const navigate = useNavigate();

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
      </div>
    </>
  )
}

export default Profile