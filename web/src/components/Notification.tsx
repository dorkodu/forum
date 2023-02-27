import { INotification } from "@api/types/notification"
import { css } from "@emotion/react";
import { Anchor, Card, Flex, Text, useMantineTheme } from "@mantine/core";
import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { date } from "../lib/date";
import { useUserStore } from "../stores/userStore";
import { autoGrid, bgColorHover, colorBW, nowrap, wrapContent } from "../styles/css";
import NotificationMenu from "./menus/NotificationMenu";
import TextParser, { PieceType } from "./TextParser";

interface Props {
  notification: INotification;
}

function Notification({ notification }: Props) {
  const theme = useMantineTheme();
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
    <Card css={css`overflow: visible; ${bgColorHover(theme)}`} shadow="sm" p="lg" m="md" radius="md" withBorder onClick={typeToOnClick()}>
      <Flex align="center" justify="space-between">
        <Flex miw={0}>
          <Anchor href={`/profile/${user.username}`} css={colorBW(theme)} onClick={gotoUser}>
            <Flex miw={0} css={autoGrid}>
              <Text truncate mr={4}><TextParser text={user.name} types={[PieceType.Emoji]} /></Text>
              <Text>@</Text>
              <Text truncate>{user.username}</Text>
            </Flex>
          </Anchor>
          <Text mx={4}>·</Text>
          <Text css={nowrap} mr={4} title={date(notification.date).format('lll')}>
            {date(notification.date).fromNow()}
          </Text>
        </Flex>

        <NotificationMenu />
      </Flex>

      <Text css={wrapContent} mt="xs">
        <TextParser text={typeToI18N()} />
      </Text>
    </Card>
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