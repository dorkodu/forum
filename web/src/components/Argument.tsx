import { css } from "@emotion/react";
import { ActionIcon, Card, Flex, Menu, Text } from "@mantine/core";
import { IconDots, IconTrash, IconArrowBigTop, IconArrowBigDown, IconPlus, IconMinus } from "@tabler/icons";
import { useReducer } from "react"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { date } from "../lib/date";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { wrapContent } from "../styles/css";

interface Props {
  argumentId: string;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Argument({ argumentId }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const { t } = useTranslation();
  const navigate = useNavigate();

  const requestLogin = useAppStore(state => state.requestLogin);

  const queryVoteArgument = useDiscussionStore(state => state.queryVoteArgument);
  const queryDeleteArgument = useDiscussionStore(state => state.queryDeleteArgument);

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

  const deleteArgument = async () => {
    if (!argument) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteArgument(argument);
    setState({ ...state, loading: false, status: status });
  }

  if (!argument || !user) return (<></>)

  return (
    <Card css={css`overflow: visible;`} shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex align="center" justify="space-between">
        <Flex miw={0}>
          <Flex miw={0} onClick={gotoUser}>
            <Text truncate pr={4}>{user.name}</Text>
            <Text>@</Text>
            <Text truncate>{user.username}</Text>
          </Flex>
          <Text ml={4} title={date(argument.date).format('lll')}>
            {date(argument.date).fromNow()}
          </Text>
        </Flex>
        <Menu shadow="md" radius="md" position="bottom-end">
          <Menu.Target>
            <ActionIcon color="dark"><IconDots /></ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {user.id === currentUserId &&
              <>
                <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={deleteArgument}>
                  {t("deleteArgument")}
                </Menu.Item>
              </>
            }
          </Menu.Dropdown>
        </Menu>
      </Flex>

      <Text css={wrapContent}>{argument.content}</Text>

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