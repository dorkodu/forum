import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import CardAlert from "../components/cards/CardAlert";
import CardLoader from "../components/cards/CardLoader";
import CardPanel from "../components/cards/CardPanel";
import { useFeedProps, useWait } from "../components/hooks";
import InfiniteScroll from "../components/InfiniteScroll";
import Notification from "../components/Notification";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useUserStore } from "../stores/userStore";

function NotificationsRoute() {
  const { t } = useTranslation();
  const state = useAppStore(state => state.options.notifications);
  const notifications = useUserStore(_state => _state.getNotifications(state.order));

  const [notificationProps, setNotificationProps] = useFeedProps();

  const fetchNotifications = async (type: "newer" | "older", refresh?: boolean) => {
    if (notificationProps.loader) return;

    setNotificationProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));

    const anchorId = useUserStore.getState().getNotificationsAnchor(type, refresh)
    const res = await sage.get(
      { a: sage.query("getUserNotifications", { type, anchorId }), },
      (query) => useWait(() => request(query))()
    )
    const status = !(!res?.a.data || res.a.error);
    const notifications = res?.a.data;

    if (refresh) useUserStore.setState(state => { state.user.notifications = {} });
    if (notifications) useUserStore.getState().setNotifications(notifications);

    setNotificationProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const changeOrder = (value: string) => {
    if (value === "newer" || value === "older") {
      useAppStore.setState(s => { s.options.profile.order = value });

      // Clear notifications when changing the order
      useUserStore.setState(state => { state.user.notifications = {} });
    }
  }

  useEffect(() => {
    notifications.length === 0 && fetchNotifications(state.order, false);
  }, [state.order]);

  if (notificationProps.loader) {
    return (
      <>
        {notificationProps.loader && <CardLoader />}
        {notificationProps.status === false &&
          <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
        }
      </>
    )
  }

  return (
    <>
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

      <InfiniteScroll
        onBottom={() => fetchNotifications(state.order, false)}
        loader={notificationProps.loader}
      >
        {notifications.map((notification) => <Notification key={notification.id} notification={notification} />)}
      </InfiniteScroll>
    </>
  )
}

export default NotificationsRoute