import { useNavigate } from "react-router-dom";
import DiscussionSummary from "../components/DiscussionSummary";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div>home</div>
      <button onClick={() => { navigate("/create-discussion") }}>create discussion</button>

      {[...Array(5)].map((_v, i) => <div key={i}><hr /><DiscussionSummary /></div>)}
    </>
  )
}

export default Home