import { useState } from "react"

function Argument() {
  const [vote, setVote] = useState<"none" | "up" | "down">("none")
  return (
    <>
      <div>
        <span>Berk Cambaz</span>
        &nbsp;
        <span>@berkcambaz</span>
        &nbsp;
        <span>16h</span>
      </div>
      <div>hello, world!</div>
      <div>
        <span>votes: 123</span>
        &nbsp;
        <button onClick={() => { setVote("up") }}>upvote</button>
        <button onClick={() => { setVote("down") }}>downvote</button>
        &nbsp;
        <span>{vote}</span>
      </div>
    </>
  )
}

export default Argument