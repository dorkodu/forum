import { useParams } from "react-router-dom";
import Discussion from "../components/Discussion"

function DiscussionRoute() {
  const params = useParams<{ id: string }>();

  return (
    <>
      <Discussion key={params.id} discussionId={params.id} />
    </>
  )
}

export default DiscussionRoute