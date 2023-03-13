import { INotification } from "@api/types/notification"
import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import NotificationMenu from "./menus/NotificationMenu";

interface Props {
  notification: INotification;
}

function Notification({ notification }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useUserStore(state => state.getUserById(notification.currentId));

  const gotoUser = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!user) return;
    navigate(`/profile/${user.username}`);
  }

  const gotoDiscussion = (ev: MouseEvent, discussionId: string) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!user) return;
    navigate(`/discussion/${discussionId}`);
  }

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

  const typeToOnClick = () => {
    /**
     * TODO:
     * In discussion argument & comment
     * instead of going to discussion, 
     * show the argument or the comment.
     * In argument vote, show the argument that is voted.
     */

    switch (notification.type) {
      case notificationTypes.userFollow:
        return gotoUser;

      case notificationTypes.discussionFavourite:
        return (ev: MouseEvent) => gotoDiscussion(ev, notification.parentId);
      case notificationTypes.discussionArgument:
        return (ev: MouseEvent) => gotoDiscussion(ev, notification.parentId);
      case notificationTypes.discussionComment:
        return (ev: MouseEvent) => gotoDiscussion(ev, notification.parentId);

      case notificationTypes.argumentVote:
        return (ev: MouseEvent) => gotoDiscussion(ev, notification.parentId);
    }
  }

  if (!user) return (<></>)

  return (
    <CardEntity
      user={user}
      entity={{ content: typeToI18N(), date: notification.date }}

      onClickUser={gotoUser}
      onClickCard={typeToOnClick()}

      componentMenu={<NotificationMenu />}
    />
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