import { MouseEvent, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { IconStar, IconMessage, IconMessages } from "@tabler/icons-react";
import { ActionIcon, Flex, Text } from "@mantine/core"
import { useAppStore } from "../stores/appStore";
import DiscussionMenu from "./menus/DiscussionMenu";
import { util } from "@/lib/web/util";
import CardEntity from "./cards/CardEntity";
import CustomTooltip from "./custom/CustomTooltip";
import { useRouter } from "next/router";
import CustomLink from "./custom/CustomLink";

interface Props {
  discussionId: string | undefined;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function DiscussionSummary({ discussionId }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const router = useRouter();
  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const queryFavouriteDiscussion = useDiscussionStore(state => state.queryFavouriteDiscussion);
  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const user = useUserStore(state => state.getUserById(discussion?.userId));
  const currentUserId = useAuthStore(state => state.userId);

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
    <CustomLink href={`/discussion/${discussion.id}`}>
      <CardEntity
        user={user}
        entity={{
          content: discussion.title,
          date: discussion.date,
          updateDate: discussion.lastUpdateDate,
        }}

        componentMenu={<DiscussionMenu user={user} discussion={discussion} />}
        componentBottom={
          <Flex direction="row" gap="xs">
            <Flex align="center">
              <ActionIcon color="dark" onClick={favouriteDiscussion}>
                <IconStar fill={discussion.favourited ? "currentColor" : "none"} />
              </ActionIcon>

              <CustomTooltip label={util.formatNumber(router.locale || "en", discussion.favouriteCount, true)}>
                <Text>{util.formatNumber(router.locale || "en", discussion.favouriteCount)}</Text>
              </CustomTooltip>
            </Flex>

            <Flex align="center">
              <IconMessages />

              <CustomTooltip label={util.formatNumber(router.locale || "en", discussion.argumentCount, true)}>
                <Text>{util.formatNumber(router.locale || "en", discussion.argumentCount)}</Text>
              </CustomTooltip>
            </Flex>

            <Flex align="center">
              <IconMessage />

              <CustomTooltip label={util.formatNumber(router.locale || "en", discussion.commentCount, true)}>
                <Text>{util.formatNumber(router.locale || "en", discussion.commentCount)}</Text>
              </CustomTooltip>
            </Flex>
          </Flex>
        }
      />
    </CustomLink>
  )
}

export default DiscussionSummary