import { useParams } from "react-router-dom";
import DiscussionEditor from "../components/DiscussionEditor"

function DiscussionEditorRoute() {
  const params = useParams<{ id: string }>();

  return (
    <>
      <DiscussionEditor id={params?.id} />
    </>
  )
}

export default DiscussionEditorRoute