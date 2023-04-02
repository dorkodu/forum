import { MouseEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { IconStar, IconMessage, IconMessages } from "@tabler/icons-react";
import { ActionIcon, Flex, px, Text, useMantineTheme } from "@mantine/core"
import { useAppStore } from "../stores/appStore";
import DiscussionMenu from "./menus/DiscussionMenu";
import { util } from "../lib/util";
import CardEntity from "./cards/CardEntity";
import CustomTooltip from "./custom/CustomTooltip";

interface Props {
  discussionId: string | undefined;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function DiscussionSummary({ discussionId }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const theme = useMantineTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const setRequestLogin = useAppStore(state => state.setRequestLogin);

  const queryFavouriteDiscussion = useDiscussionStore(state => state.queryFavouriteDiscussion);
  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const user = useUserStore(state => state.getUserById(discussion?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const gotoDiscussion = () => {
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
    <CardEntity
      user={user}
      entity={{
        content: discussion.title,
        date: discussion.date,
        updateDate: discussion.lastUpdateDate,
      }}

      onClickCard={gotoDiscussion}
      onClickUser={gotoUser}

      componentMenu={<DiscussionMenu user={user} discussion={discussion} />}
      componentBottom={
        <Flex direction="row" gap="xs">
          <Flex align="center" gap={px(theme.spacing.xs) / 2}>
            <ActionIcon color="yellow" onClick={favouriteDiscussion}>
              <IconStar fill={discussion.favourited ? "currentColor" : "none"} />
            </ActionIcon>

            <CustomTooltip label={util.formatNumber(discussion.favouriteCount, true)}>
              <Text>{util.formatNumber(discussion.favouriteCount)}</Text>
            </CustomTooltip>
          </Flex>

          <Flex align="center" gap={px(theme.spacing.xs) / 2}>
            <IconMessages />

            <CustomTooltip label={util.formatNumber(discussion.argumentCount, true)}>
              <Text>{util.formatNumber(discussion.argumentCount)}</Text>
            </CustomTooltip>
          </Flex>

          <Flex align="center" gap={px(theme.spacing.xs) / 2}>
            <IconMessage />

            <CustomTooltip label={util.formatNumber(discussion.commentCount, true)}>
              <Text>{util.formatNumber(discussion.commentCount)}</Text>
            </CustomTooltip>
          </Flex>
        </Flex>
      }
    />
  )
}

export default DiscussionSummary