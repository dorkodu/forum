import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useParams } from "react-router-dom";
import DiscussionEditor from "../components/DiscussionEditor"

function DiscussionEditorRoute() {
  const params = useParams<{ id: string }>();

  return (
    <DefaultLayout>
      <DiscussionEditor id={params?.id} />
    </DefaultLayout>
  )
}

export default DiscussionEditorRoute