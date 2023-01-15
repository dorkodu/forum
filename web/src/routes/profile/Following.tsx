import Profile from "../../components/Profile"
import ProfileSummary from "../../components/ProfileSummary"

function Following() {
  return (
    <>
      <Profile />
      {[...Array(5)].map((_v, i) => <div key={i}><hr /><ProfileSummary /></div>)}
    </>
  )
}

export default Following