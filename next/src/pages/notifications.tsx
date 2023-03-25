import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import CardPanel from "../components/cards/CardPanel";
import { useFeedProps, wait } from "../components/hooks";
import InfiniteScroll from "../components/InfiniteScroll";
import Notification from "../components/Notification";
import { request, sage } from "../stores/api";
import { appStore, useAppStore } from "../stores/appStore";
import { authStore } from "../stores/authStore";
import { userStore, useUserStore } from "../stores/userStore";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Head from "next/head";
import { INotification } from "@/types/notification";

export default function NotificationsRoute() {
  const { t } = useTranslation();
  const state = useAppStore(state => state.options.notifications);
  const notifications = useUserStore(_state => _state.getNotifications(state.order));

  const [notificationProps, setNotificationProps] = useFeedProps();

  const fetchNotifications = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!skipWaiting && notificationProps.loading) return;

    setNotificationProps(s => ({ ...s, loading: true, status: undefined }));

    const anchorId = userStore().getState().getNotificationsAnchor(type, refresh)
    const res = await sage.get(
      {
        a: sage.query("getUserNotifications", { type, anchorId }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" })
      },
      (query) => wait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const notifications = res?.a.data as INotification[];
    const users = res?.b.data;

    if (refresh) userStore().setState(state => { state.user.notifications = {} });
    if (notifications) userStore().getState().setNotifications(notifications);
    if (users) userStore().getState().setUsers(users);

    // Set user.hasNotification to false since notifications are viewed
    const currentUserId = authStore().getState().userId;
    userStore().setState(s => {
      if (!currentUserId) return;
      const currentUser = s.user.entities[currentUserId]
      if (currentUser) currentUser.hasNotification = false;
    });

    setNotificationProps(s => ({ ...s, loading: false, status, hasMore: notifications?.length !== 0 }));
  }

  const changeOrder = (value: string) => {
    // See /routes/Home.tsx for explanation
    if (notificationProps.loading) return;

    if (value === "newer" || value === "older") {
      appStore().setState(s => { s.options.notifications.order = value });

      // Clear notifications when changing the order
      userStore().setState(state => { state.user.notifications = {} });
    }
  }

  useEffect(() => {
    notifications.length === 0 && fetchNotifications(state.order, false);
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
            refresh={() => fetchNotifications(state.order, true)}
            next={() => fetchNotifications(state.order, false, true)}
            hasMore={notificationProps.hasMore}
          >
            <CardPanel
              segments={[
                {
                  value: state.order,
                  setValue: changeOrder,
                  label: t("notificationsOrder"),
                  data: [
                    { label: t("newer"), value: "newer" },
                    { label: t("older"), value: "older" },
                  ]
                },
              ]}
            />

            {notifications.map((notification) => <Notification key={notification.id} notification={notification} />)}
          </InfiniteScroll>
        </DefaultLayout>
      </main>
    </>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}