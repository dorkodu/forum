import { color } from "@/styles/css";
import { ActionIcon, Flex, px, Text, useMantineTheme } from "@mantine/core";
import { IconArrowBigUp, IconArrowBigDown, IconPlus, IconMinus } from "@tabler/icons-react";
import { MouseEvent, useState } from "react"
import { useNavigate } from "react-router-dom";
import { util } from "../lib/util";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import CustomTooltip from "./custom/CustomTooltip";
import ArgumentMenu from "./menus/ArgumentMenu";

interface Props {
  argumentId: string;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Argument({ argumentId }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const theme = useMantineTheme();
  const navigate = useNavigate();
  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const queryVoteArgument = useDiscussionStore(state => state.queryVoteArgument);
  const argument = useDiscussionStore(state => state.getArgument(argumentId));
  const user = useUserStore(state => state.getUserById(argument?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const gotoUser = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!user) return;
    navigate(`/profile/${user.username}`);
  }

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

      onClickUser={gotoUser}

      componentMenu={<ArgumentMenu user={user} argument={argument} />}
      componentBottom={
        <Flex align="center" gap={px(theme.spacing.xs) / 2}>
          {argument.type ? <IconPlus color={color(theme, theme.colors.green)} /> : <IconMinus color={color(theme, theme.colors.red)} />}

          <Flex direction="row" align="center">
            <ActionIcon color={argument.votedType === true ? "green" : "dark"} onClick={() => voteArgument(true)}>
              <IconArrowBigUp fill={argument.voted && (argument.votedType ? "currentColor" : "none") || "none"} />
            </ActionIcon>

            <CustomTooltip label={util.formatNumber(argument.voteCount, true)}>
              <Text px={px(theme.spacing.xs) / 2}>{util.formatNumber(argument.voteCount)}</Text>
            </CustomTooltip>

            <ActionIcon color={argument.votedType === false ? "red" : "dark"} onClick={() => voteArgument(false)}>
              <IconArrowBigDown fill={argument.voted && (!argument.votedType ? "currentColor" : "none") || "none"} />
            </ActionIcon>
          </Flex>
        </Flex>
      }
    />
  )
}

export default Argument