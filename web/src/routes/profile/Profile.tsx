import DiscussionSummary from "../../components/DiscussionSummary"
import Profile from "../../components/Profile"

function ProfileRoute() {
  return (
    <>
      <Profile />

      {[...Array(5)].map((_v, i) => <div key={i}><hr /><DiscussionSummary /></div>)}
    </>
  )
}

export default ProfileRoute