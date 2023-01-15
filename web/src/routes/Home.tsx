import DiscussionSummary from "../components/DiscussionSummary";

function Home() {
  return (
    <>
      <div>home</div>

      {[...Array(5)].map((_v, i) => <div key={i}><hr /><DiscussionSummary /></div>)}
    </>
  )
}

export default Home