import Profile from "../../components/Profile"
import ProfileSummary from "../../components/ProfileSummary"

function Follower() {
  return (
    <>
      <Profile />
      {[...Array(5)].map((_v, i) => <div key={i}><hr /><ProfileSummary /></div>)}
    </>
  )
}

export default Follower