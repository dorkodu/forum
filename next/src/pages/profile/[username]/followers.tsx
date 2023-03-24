import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import CardAlert from "@/components/cards/CardAlert";
import CardPanel from "@/components/cards/CardPanel";
import { useFeedProps, wait } from "@/components/hooks";
import InfiniteScroll from "@/components/InfiniteScroll";
import Profile from "@/components/Profile"
import ProfileSummary from "@/components/ProfileSummary"
import { request, sage } from "@/stores/api";
import { appStore, useAppStore } from "@/stores/appStore";
import { userStore, useUserStore } from "@/stores/userStore";
import { useRouter } from "next/router";
import Head from "next/head";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { GetStaticPaths } from "next";

export default function Follower() {
  const router = useRouter();
  const { t } = useTranslation();

  const state = useAppStore(state => state.options.followers);
  const username = typeof router.query.username === "string" ? router.query.username : undefined;
  const user = useUserStore(state => state.getUserByUsername(username));
  const followers = useUserStore(_state => _state.getUserFollowers(user, state.order));

  const [userProps, setUserProps] = useFeedProps({ loading: !user });
  const [followerProps, setFollowerProps] = useFeedProps();

  const fetchFollowers = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!user) return;
    if (!skipWaiting && followerProps.loading) return;

    setFollowerProps(s => ({ ...s, loading: true, status: undefined }));

    const anchorId = userStore().getState().getUserFollowersAnchor(user, type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserFollowers", { userId: user.id, type, anchorId }), },
      (query) => wait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const followers = res?.a.data;

    if (refresh) userStore().setState(state => { user && delete state.user.followers[user.id] });
    if (followers) {
      userStore().getState().setUsers(followers);
      userStore().getState().addUserFollowers(user, followers);
    }

    setFollowerProps(s => ({ ...s, loading: false, status, hasMore: followers?.length !== 0 }));
  }

  const fetchRoute = async () => {
    setUserProps(s => ({ ...s, loading: true, status: undefined }));

    const res = await sage.get(
      {
        a: sage.query("getUser", { username }, { ctx: "a" }),
        b: sage.query("getUserFollowers", { type: state.order, anchorId: "-1" }, { ctx: "a", wait: "a" }),
      },
      (query) => wait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const user = res?.a.data && res?.a.data[0];
    const followers = res?.b.data;

    // Clear feed when fetching route since it's used by infinite scroll
    userStore().setState(state => { user && delete state.user.followers[user.id] });

    if (user) userStore().getState().setUsers([user]);
    if (followers) userStore().getState().setUsers(followers);
    if (user && followers) userStore().getState().addUserFollowers(user, followers);

    setUserProps(s => ({ ...s, loading: false, status: status }));
    setFollowerProps(s => ({ ...s, hasMore: true }));
  }

  const changeOrder = (value: string) => {
    // See /routes/Home.tsx for explanation
    if (followerProps.loading) return;

    if (value === "newer" || value === "older") {
      appStore().setState(s => { s.options.followers.order = value });

      // Clear followers when changing the order
      userStore().setState(state => { user && delete state.user.followers[user.id] });
    }
  }

  useEffect(() => {
    if (!user) fetchRoute();
    else followers.length === 0 && fetchFollowers(state.order, false);
  }, [state.order]);

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
            next={() => fetchFollowers(state.order, false, true)}
            hasMore={followerProps.hasMore}
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
                      label: t("followersOrder"),
                      data: [
                        { label: t("newer"), value: "newer" },
                        { label: t("older"), value: "older" },
                      ]
                    },
                  ]}
                />

                {followers.map((follower) => <ProfileSummary key={follower.id} user={follower} />)}
              </>
            }
          </InfiniteScroll>
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