import { INotification } from "@/types/notification"
import { useTranslation } from "react-i18next";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import CustomLink from "./custom/CustomLink";
import NotificationMenu from "./menus/NotificationMenu";

interface Props {
  notification: INotification;
}

function Notification({ notification }: Props) {
  const { t } = useTranslation();
  const user = useUserStore(state => state.getUserById(notification.currentId));

  const typeToI18N = () => {
    switch (notification.type) {
      case notificationTypes.userFollow:
        return t("notification.userFollow");

      case notificationTypes.discussionFavourite:
        return t("notification.discussionFavourite");
      case notificationTypes.discussionArgument:
        return t("notification.discussionArgument");
      case notificationTypes.discussionComment:
        return t("notification.discussionComment");

      case notificationTypes.argumentVote:
        return t("notification.argumentVote");
    }
  }

  const typeToHref = () => {
    switch (notification.type) {
      case notificationTypes.userFollow:
        return `/profile/${user.username}`;

      case notificationTypes.discussionFavourite:
        return `/discussion/${notification.parentId}`;
      case notificationTypes.discussionArgument:
        return `/discussion/${notification.parentId}?argument=${notification.childId}`;
      case notificationTypes.discussionComment:
        return `/discussion/${notification.parentId}?comment=${notification.childId}`;

      case notificationTypes.argumentVote:
        return `/discussion/${notification.parentId}?argument=${notification.childId}`;
    }
  }

  if (!user) return (<></>)

  return (
    <CustomLink href={typeToHref()}>
      <CardEntity
        user={user}
        entity={{ content: typeToI18N(), date: notification.date }}

        componentMenu={<NotificationMenu />}
      />
    </CustomLink>
  )
}

export default Notification

export const notificationTypes = {
  userFollow: 0,

  discussionFavourite: 1,
  discussionArgument: 2,
  discussionComment: 3,

  argumentVote: 4,
} as const;