import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import CardAlert from "../../components/cards/CardAlert";
import CardPanel from "../../components/cards/CardPanel";
import DiscussionSummary from "../../components/DiscussionSummary";
import { useFeedProps, wait } from "../../components/hooks";
import InfiniteScroll from "../../components/InfiniteScroll";
import Profile from "../../components/Profile"
import { request, sage } from "../../stores/api";
import { appStore, useAppStore } from "../../stores/appStore";
import { discussionStore, useDiscussionStore } from "../../stores/discussionStore";
import { userStore, useUserStore } from "../../stores/userStore";
import Head from "next/head";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { IUser } from "@/types/user";
import user from "@/lib/api/controllers/user";

type CustomProps = { user: IUser | null }

export default function ProfileRoute(props: CustomProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const state = useAppStore(state => state.options.profile);
  const username = typeof router.query.username === "string" ? router.query.username : undefined;
  const user = useUserStore(state => state.getUserByUsername(username)) ?? props.user ?? undefined;
  const discussions = useDiscussionStore(_state => _state.getUserDiscussions(user?.id, state.order));

  const [userProps, setUserProps] = useFeedProps({ loading: !user });
  const [discussionProps, setDiscussionProps] = useFeedProps();

  const fetchDiscussions = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!user) return;
    if (!skipWaiting && discussionProps.loading) return;

    setDiscussionProps(s => ({ ...s, loading: true, status: undefined }));

    const anchorId = discussionStore().getState().getUserDiscussionAnchor(user.id, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserDiscussions", { userId: user.id, type, anchorId }), },
      (query) => wait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const discussions = res?.a.data;

    if (refresh) discussionStore().setState(state => { user && delete state.discussion.users[user.id] });
    if (discussions) discussionStore().getState().setUserDiscussions(user.id, discussions);

    setDiscussionProps(s => ({ ...s, loading: false, status, hasMore: discussions?.length !== 0 }));
  }

  const fetchRoute = async () => {
    setUserProps(s => ({ ...s, loading: true, status: undefined }));

    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserDiscussions", { type: state.order, anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => wait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const discussions = res?.b.data;

    // Clear feed when fetching route since it's used by infinite scroll
    discussionStore().setState(state => { user && delete state.discussion.users[user.id] });

    if (user) userStore().getState().setUsers([user]);
    if (user && discussions) discussionStore().getState().setUserDiscussions(user.id, discussions);

    setUserProps(s => ({ ...s, loading: false, status: status }));
    setDiscussionProps(s => ({ ...s, hasMore: true }));
  }

  const changeOrder = (value: string) => {
    // See /routes/Home.tsx for explanation
    if (discussionProps.loading) return;

    if (value === "newer" || value === "older") {
      appStore().setState(s => { s.options.profile.order = value });

      // Clear feed when changing the order
      discussionStore().setState(state => { user && delete state.discussion.users[user.id] });
    }
  }

  useEffect(() => {
    if (!user && !props.user) fetchRoute();
    else discussions.length === 0 && fetchDiscussions(state.order, false);
  }, [state.order]);

  useEffect(() => { props.user && userStore().getState().setUsers([props.user]) }, []);

  return (
    <>
      <Head>
        <title>Forum</title>
        <meta name="title" content="Forum" />
        <meta name="description" content="Social Discourse @ Dorkodu" />
      </Head>
      <main>
        <DefaultLayout>
          <InfiniteScroll
            refresh={fetchRoute}
            next={() => fetchDiscussions(state.order, false, true)}
            hasMore={discussionProps.hasMore}
          >
            {!user ?
              <>
                {userProps.status === false &&
                  <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
                }
              </>

              :

              <>
                <Profile user={user} />

                <CardPanel
                  segments={[
                    {
                      value: state.order,
                      setValue: changeOrder,
                      label: t("discussionOrder"),
                      data: [
                        { label: t("newer"), value: "newer" },
                        { label: t("older"), value: "older" },
                      ]
                    },
                  ]}
                />

                {discussions.map((discussion) => <DiscussionSummary key={discussion.id} discussionId={discussion.id} />)}
              </>
            }
          </InfiniteScroll>
        </DefaultLayout>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (props) => {
  const req = props.req as NextApiRequest;
  const res = props.res as NextApiResponse;

  let userOutput: IUser | null = null;
  const username = typeof props.query.username === "string" ? props.query.username : undefined;

  if (username) {
    const input: typeof user.getUser.arg = { username };
    const result = await user.getUser.executor(input, { req, res, shared: {} });
    userOutput = result.data?.[0] ?? null;
  }

  return {
    props: {
      ...(await serverSideTranslations(props.locale || "en", ['common'])),
      user: userOutput,
    }
  } satisfies { props: CustomProps }
}