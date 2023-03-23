import DiscussionEditor from "@/components/DiscussionEditor"
import { useRouter } from "next/router"

function DiscussionEditorRoute() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <DiscussionEditor id={id} />
}

export default DiscussionEditorRoute