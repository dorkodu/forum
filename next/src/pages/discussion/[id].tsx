import Discussion from "@/components/Discussion"
import DefaultLayout from "@/components/layouts/DefaultLayout";
import discussion from "@/lib/api/controllers/discussion";
import { discussionStore } from "@/stores/discussionStore";
import { IArgument } from "@/types/argument";
import { IComment } from "@/types/comment";
import { IDiscussion } from "@/types/discussion";
import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type CustomProps = {
  discussion: IDiscussion | null,
  argument: IArgument | null,
  comment: IComment | null,
}

export default function DiscussionRoute(props: CustomProps) {
  const [initial, setInitial] = useState(true);
  if (initial && props.discussion) {
    discussionStore().getState().setUserDiscussions(props.discussion.userId, [props.discussion]);
    props.argument && discussionStore().getState().setArguments(props.discussion.id, [props.argument], "top");
    props.comment && discussionStore().getState().setComments(props.discussion.id, [props.comment]);
  }

  const router = useRouter();
  const discussionId = typeof router.query.id === "string" ? router.query.id : undefined;

  // Argument id have precedence over comment id
  const argumentId = typeof router.query.argument === "string" ? router.query.argument : undefined;;
  const commentId = typeof router.query.comment === "string" ? router.query.comment : undefined;

  useEffect(() => { setInitial(false) }, []);

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

export const getServerSideProps: GetServerSideProps = async (props) => {
  const req = props.req as NextApiRequest;
  const res = props.res as NextApiResponse;

  let out: CustomProps = { discussion: null, argument: null, comment: null }

  const discussionId = typeof props.query.id === "string" ? props.query.id : undefined;
  const argumentId = typeof props.query.argument === "string" ? props.query.argument : undefined;;
  const commentId = typeof props.query.comment === "string" ? props.query.comment : undefined;

  if (discussionId) {
    const discussionPromise = discussion.getDiscussion.executor(
      { discussionId } satisfies typeof discussion.getDiscussion.arg,
      { req, res, shared: {} },
    );

    const argumentPromise = !argumentId ? undefined : discussion.getArgument.executor(
      { argumentId } satisfies typeof discussion.getArgument.arg,
      { req, res, shared: {} },
    );

    const commentPromise = !commentId ? undefined : discussion.getComment.executor(
      { commentId } satisfies typeof discussion.getComment.arg,
      { req, res, shared: {} },
    );

    const results = await Promise.all([discussionPromise, argumentPromise, commentPromise]);
    out.discussion = results[0].data ?? null;
    out.argument = results[1]?.data ?? null;
    out.comment = results[2]?.data ?? null;
  }

  return {
    props: {
      ...(await serverSideTranslations(props.locale || "en", ['common'])),
      ...out,
    },
  } satisfies { props: CustomProps }
}