import DiscussionEditor from "@/components/DiscussionEditor"
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Head from "next/head";
import { useRouter } from "next/router"

function DiscussionEditorRoute() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return (
    <>
      <Head>
        <title>Forum</title>
        <meta name="title" content="Forum" />
        <meta name="description" content="Social Discourse @ Dorkodu" />
      </Head>
      <main>
        <DefaultLayout>
          <DiscussionEditor id={id} />
        </DefaultLayout>
      </main>
    </>
  )
}

export default DiscussionEditorRoute