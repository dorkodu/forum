import { useParams } from "react-router-dom";
import Profile from "../../components/Profile"

function ProfileRoute() {
  const params = useParams<{ username: string }>();

  return (
    <>
      <Profile username={params.username} />
    </>
  )
}

export default ProfileRoute