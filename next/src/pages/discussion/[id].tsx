import Discussion from "@/components/Discussion"
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";

export default function DiscussionRoute() {
  const router = useRouter();
  const discussionId = typeof router.query.id === "string" ? router.query.id : undefined;

  // Argument id have precedence over comment id
  const argumentId = typeof router.query.argument === "string" ? router.query.argument : undefined;;
  const commentId = typeof router.query.comment === "string" ? router.query.comment : undefined;

  return (
    <>
      <Head>
        <title>Forum</title>
        <meta name="title" content="Forum" />
        <meta name="description" content="Social Discourse @ Dorkodu" />
      </Head>
      <main>
        <DefaultLayout>
          <Discussion
            key={discussionId}
            discussionId={discussionId}
            argumentId={argumentId}
            commentId={argumentId ?? commentId}
          />
        </DefaultLayout>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}