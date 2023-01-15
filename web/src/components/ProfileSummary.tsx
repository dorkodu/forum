import { useNavigate } from "react-router-dom"

function ProfileSummary() {
  const navigate = useNavigate();

  return (
    <>
      <div onClick={() => { navigate("/profile/123") }}>
        <span>Berk Cambaz</span>
        &nbsp;
        <span>@berkcambaz</span>
      </div>
      <div>hello, world</div>
      <div>
        <span>123 followers</span>
        &nbsp;
        <span>123 following</span>
      </div>
    </>
  )
}

export default ProfileSummary