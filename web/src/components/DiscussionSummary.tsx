import { MouseEvent, useReducer } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import {
  IconStar, IconMessage, IconMessages, IconActivity, IconDots, IconTrash, IconEdit
} from "@tabler/icons";

import { ActionIcon, Card, Flex, Menu, Text } from "@mantine/core"
import { date } from "../lib/date";
import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { nowrap, wrapContent } from "../styles/css";
import { useAppStore } from "../stores/appStore";

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

  const requestLogin = useAppStore(state => state.requestLogin);

  const queryFavouriteDiscussion = useDiscussionStore(state => state.queryFavouriteDiscussion);
  const queryDeleteDiscussion = useDiscussionStore(state => state.queryDeleteDiscussion);
  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const user = useUserStore(state => state.getUserById(discussion?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const gotoDiscussion = () => {
    if (!discussion) return;
    const target = `/discussion/${discussion.id}`;
    if (location.pathname !== target) navigate(target);
  }

  const gotoUser = () => {
    if (!user) return;
    navigate(`/profile/${user.username}`);
  }

  const gotoDiscussionEditor = (ev: MouseEvent) => {
    ev.stopPropagation();

    if (!discussion) return;
    navigate(`/discussion-editor/${discussion.id}`);
  }

  const favouriteDiscussion = async (ev: MouseEvent) => {
    ev.stopPropagation();

    // If user is trying to favourite while not being logged in
    if (!currentUserId) return requestLogin(true);

    if (!discussion) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFavouriteDiscussion(discussion);
    setState({ ...state, loading: false, status: status });
  }

  const deleteDiscussion = async (ev: MouseEvent) => {
    ev.stopPropagation();

    if (!discussion) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteDiscussion(discussion);
    setState({ ...state, loading: false, status: status });
    
    // Redirect to home after successfully deleting the discussion
    if (status) navigate("/home");
  }

  if (!discussion || !user) return (<></>)

  return (
    <Card css={css`overflow: visible;`} shadow="sm" p="lg" m="md" radius="md" withBorder onClick={gotoDiscussion}>
      <Flex align="center" justify="space-between">
        <Flex miw={0}>
          <Flex miw={0} onClick={gotoUser}>
            <Text truncate pr={4}>{user.name}</Text>
            <Text>@</Text>
            <Text truncate>{user.username}</Text>
          </Flex>
          <Text mx={4}>·</Text>
          <Text css={nowrap} title={date(discussion.date).format('lll')}>
            {date(discussion.date).fromNow()}
          </Text>
        </Flex>
        <Menu shadow="md" radius="md" position="bottom-end">
          <Menu.Target>
            <ActionIcon color="dark" onClick={(ev) => { ev.stopPropagation() }}>
              <IconDots />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {user.id === currentUserId &&
              <>
                <Menu.Item icon={<IconEdit size={14} />} onClick={gotoDiscussionEditor}>
                  {t("editDiscussion")}
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={deleteDiscussion}>
                  {t("deleteDiscussion")}
                </Menu.Item>
              </>
            }
          </Menu.Dropdown>
        </Menu>
      </Flex>

      <Text css={wrapContent}>{discussion.title}</Text>

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
              t("discussionUpdateNever") :
              date(discussion.lastUpdateDate).fromNow()
            }
          </span>
        </Flex>
      </Flex>
    </Card>
  )
}

export default DiscussionSummary