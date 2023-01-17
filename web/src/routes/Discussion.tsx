import { useParams } from "react-router-dom";
import Discussion from "../components/Discussion"

function DiscussionRoute() {
  const params = useParams<{ id: string }>();

  return (
    <>
      <Discussion discussionId={params.id} />
    </>
  )
}

export default DiscussionRoute