import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useParams, useSearchParams } from "react-router-dom";
import Discussion from "../components/Discussion"

function DiscussionRoute() {
  const params = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const discussionId = params.id;

  // Argument id have precedence over comment id
  const argumentId = searchParams.get("argument") ?? undefined;
  const commentId = searchParams.get("comment") ?? undefined;

  return (
    <DefaultLayout>
      <Discussion
        key={discussionId}
        discussionId={discussionId}
        argumentId={argumentId}
        commentId={argumentId ?? commentId}
      />
    </DefaultLayout>
  )
}

export default DiscussionRoute