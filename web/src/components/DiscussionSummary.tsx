import { MouseEvent, useReducer } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import {
  IconStar, IconMessage, IconMessages, IconActivity
} from "@tabler/icons";

import { ActionIcon, Anchor, Card, Flex, Text } from "@mantine/core"
import { date } from "../lib/date";
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { autoGrid, nowrap, wrapContent } from "../styles/css";
import { useAppStore } from "../stores/appStore";
import TextParser, { PieceType } from "./TextParser";
import DiscussionMenu from "./menus/DiscussionMenu";

interface Props {
  discussionId: string | undefined;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function DiscussionSummary({ discussionId }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const setRequestLogin = useAppStore(state => state.setRequestLogin);

  const queryFavouriteDiscussion = useDiscussionStore(state => state.queryFavouriteDiscussion);
  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const user = useUserStore(state => state.getUserById(discussion?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const gotoDiscussion = (ev: MouseEvent) => {
    ev.preventDefault()

    if (!discussion) return;
    const target = `/discussion/${discussion.id}`;
    if (location.pathname !== target) navigate(target);
  }

  const gotoUser = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!user) return;
    navigate(`/profile/${user.username}`);
  }

  const favouriteDiscussion = async (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    // If user is trying to favourite while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (!discussion) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFavouriteDiscussion(discussion);
    setState({ ...state, loading: false, status: status });
  }

  if (!discussion || !user) return (<></>)

  return (
    <Anchor href={`/discussion/${discussion.id}`} variant="text" underline={false} onClick={gotoDiscussion}>
      <Card css={css`overflow: visible;`} shadow="sm" p="lg" m="md" radius="md" withBorder>
        <Flex align="center" justify="space-between">
          <Flex miw={0}>
            <Flex miw={0} onClick={gotoUser} css={autoGrid}>
              <Text truncate mr={4}><TextParser text={user.name} types={[PieceType.Emoji]} /></Text>
              <Text>@</Text>
              <Text truncate>{user.username}</Text>
            </Flex>
            <Text mx={4}>·</Text>
            <Text css={nowrap} mr={4} title={date(discussion.date).format('lll')}>
              {date(discussion.date).fromNow()}
            </Text>
          </Flex>

          <DiscussionMenu user={user} discussion={discussion} />
        </Flex>

        <Text css={wrapContent}>
          <TextParser text={discussion.title} />
        </Text>

        <Flex align="center" gap="xs">
          <Flex align="center">
            <ActionIcon color="dark" onClick={favouriteDiscussion}>
              <IconStar fill={discussion.favourited ? "currentColor" : "none"} />
            </ActionIcon>
            <span>{discussion.favouriteCount}</span>
          </Flex>
          <Flex align="center">
            <IconMessages />
            <span>{discussion.argumentCount}</span>
          </Flex>
          <Flex align="center">
            <IconMessage />
            <span>{discussion.commentCount}</span>
          </Flex>
          <Flex align="center">
            <IconActivity />
            <span>
              {discussion.lastUpdateDate === -1 ?
                t("discussion.never") :
                date(discussion.lastUpdateDate).fromNow()
              }
            </span>
          </Flex>
        </Flex>
      </Card>
    </Anchor>
  )
}

export default DiscussionSummary