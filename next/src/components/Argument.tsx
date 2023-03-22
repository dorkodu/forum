import { ActionIcon, Flex, Text } from "@mantine/core";
import { IconArrowBigUp, IconArrowBigDown, IconPlus, IconMinus } from "@tabler/icons-react";
import { useState } from "react"
import { util } from "@/lib/web/util";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import CustomTooltip from "./custom/CustomTooltip";
import ArgumentMenu from "./menus/ArgumentMenu";
import { useRouter } from "next/router";

interface Props {
  argumentId: string;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Argument({ argumentId }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const router = useRouter();
  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const queryVoteArgument = useDiscussionStore(state => state.queryVoteArgument);
  const argument = useDiscussionStore(state => state.getArgument(argumentId));
  const user = useUserStore(state => state.getUserById(argument?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const voteArgument = async (type: boolean) => {
    // If user is trying to vote argument while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (!argument) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryVoteArgument(argument, type);
    setState({ ...state, loading: false, status: status });
  }

  if (!argument || !user) return (<></>)

  return (
    <CardEntity
      user={user}
      entity={{
        content: argument.content,
        date: argument.date
      }}

      componentMenu={<ArgumentMenu user={user} argument={argument} />}
      componentBottom={
        <Flex align="center">
          {argument.type ? <IconPlus /> : <IconMinus />}

          <ActionIcon color="dark" onClick={() => voteArgument(true)}>
            <IconArrowBigUp
              fill={argument.voted && (argument.votedType ? "currentColor" : "none") || "none"}
            />
          </ActionIcon>

          <CustomTooltip label={util.formatNumber(router.locale || "en", argument.voteCount, true)}>
            <Text>{util.formatNumber(router.locale || "en", argument.voteCount)}</Text>
          </CustomTooltip>

          <ActionIcon color="dark" onClick={() => voteArgument(false)}>
            <IconArrowBigDown
              fill={argument.voted && (!argument.votedType ? "currentColor" : "none") || "none"}
            />
          </ActionIcon>
        </Flex>
      }
    />
  )
}

export default Argument