import { useState } from "react"
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  argumentId: string;
}

function Argument({ argumentId }: Props) {
  const [vote, setVote] = useState<"none" | "up" | "down">("none")

  const argument = useDiscussionStore(state => state.getArgument(argumentId));
  const user = useUserStore(state => state.getUserById(argument?.userId));

  if (!argument || !user) return (<></>)

  return (
    <>
      <div>
        <span>{user.name}</span>
        &nbsp;
        <span>@{user.username}</span>
        &nbsp;
        <span>{argument.date}</span>
      </div>
      <div>{argument.content}</div>
      <div>
        <span>votes: {argument.voteCount}</span>
        &nbsp;
        <button onClick={() => { setVote(vote === "up" ? "none" : "up") }}>upvote</button>
        <button onClick={() => { setVote(vote === "down" ? "none" : "down") }}>downvote</button>
        &nbsp;
        <span>{vote}</span>
      </div>
    </>
  )
}

export default Argument