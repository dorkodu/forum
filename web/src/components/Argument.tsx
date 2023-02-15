import { css } from "@emotion/react";
import { ActionIcon, Card, Flex, Text } from "@mantine/core";
import { IconArrowBigTop, IconArrowBigDown, IconPlus, IconMinus } from "@tabler/icons";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { date } from "../lib/date";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { autoGrid, nowrap, wrapContent } from "../styles/css";
import ArgumentMenu from "./menus/ArgumentMenu";
import TextParser, { PieceType } from "./TextParser";

interface Props {
  argumentId: string;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Argument({ argumentId }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const navigate = useNavigate();
  const requestLogin = useAppStore(state => state.requestLogin);
  const queryVoteArgument = useDiscussionStore(state => state.queryVoteArgument);
  const argument = useDiscussionStore(state => state.getArgument(argumentId));
  const user = useUserStore(state => state.getUserById(argument?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const gotoUser = () => {
    if (!user) return;
    navigate(`/profile/${user.username}`);
  }

  const voteArgument = async (type: boolean) => {
    // If user is trying to vote argument while not being logged in
    if (!currentUserId) return requestLogin(true);

    if (!argument) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryVoteArgument(argument, type);
    setState({ ...state, loading: false, status: status });
  }

  if (!argument || !user) return (<></>)

  return (
    <Card css={css`overflow: visible;`} shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex align="center" justify="space-between">
        <Flex miw={0}>
          <Flex miw={0} onClick={gotoUser} css={autoGrid}>
            <Text truncate mr={4}><TextParser text={user.name} types={[PieceType.Emoji]} /></Text>
            <Text>@</Text>
            <Text truncate>{user.username}</Text>
          </Flex>
          <Text mx={4}>·</Text>
          <Text css={nowrap} mr={4} title={date(argument.date).format('lll')}>
            {date(argument.date).fromNow()}
          </Text>
        </Flex>

        <ArgumentMenu user={user} argument={argument} />
      </Flex>

      <Text css={wrapContent}>
        <TextParser text={argument.content} />
      </Text>

      <Flex align="center">
        {argument.type ? <IconPlus /> : <IconMinus />}

        <ActionIcon color="dark" onClick={() => voteArgument(true)}>
          <IconArrowBigTop
            fill={argument.voted && (argument.votedType ? "currentColor" : "none") || "none"}
          />
        </ActionIcon>

        <span>{argument.voteCount}</span>

        <ActionIcon color="dark" onClick={() => voteArgument(false)}>
          <IconArrowBigDown
            fill={argument.voted && (!argument.votedType ? "currentColor" : "none") || "none"}
          />
        </ActionIcon>
      </Flex>
    </Card>
  )
}

export default Argument