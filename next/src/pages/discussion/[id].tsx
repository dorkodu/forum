import Discussion from "@/components/Discussion"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

export default function DiscussionRoute() {
  const router = useRouter();
  const discussionId = typeof router.query.id === "string" ? router.query.id : undefined;

  // Argument id have precedence over comment id
  const argumentId = typeof router.query.argument === "string" ? router.query.argument : undefined;;
  const commentId = typeof router.query.comment === "string" ? router.query.comment : undefined;

  return (
    <Discussion
      key={discussionId}
      discussionId={discussionId}
      argumentId={argumentId}
      commentId={argumentId ?? commentId}
    />
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}