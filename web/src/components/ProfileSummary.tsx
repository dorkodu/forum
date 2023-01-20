import { IUser } from "@api/types/user";
import { useNavigate } from "react-router-dom"

interface Props {
  user: IUser;
}

function ProfileSummary({ user }: Props) {
  const navigate = useNavigate();

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
      </div>
    </>
  )
}

export default ProfileSummary