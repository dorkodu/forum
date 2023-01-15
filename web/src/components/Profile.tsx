import { useNavigate } from "react-router-dom"

function Profile() {
  const navigate = useNavigate();

  return (
    <>
      <div>Berk Cambaz</div>
      <div>@berkcambaz</div>
      <div>hello, world!</div>
      <div>joined 1 January, 2023</div>
      <div>
        <span onClick={() => { navigate("/profile/123/followers") }}>123 followers</span>
        &nbsp;
        <span onClick={() => { navigate("/profile/123/following") }}>123 following</span>
      </div>
    </>
  )
}

export default Profile