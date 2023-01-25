import { css } from "@emotion/react";
import { ActionIcon, Card, Flex, Menu, Text } from "@mantine/core";
import { IconDots, IconTrash } from "@tabler/icons";
import { useReducer } from "react";
import { date } from "../lib/date";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  commentId: string;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function Comment({ commentId }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const queryDeleteComment = useDiscussionStore(state => state.queryDeleteComment);

  const comment = useDiscussionStore(state => state.getComment(commentId));
  const user = useUserStore(state => state.getUserById(comment?.userId));
  const currentUserId = useAuthStore(state => state.userId);

  const deleteComment = async () => {
    if (!comment) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteComment(comment);
    setState({ ...state, loading: false, status: status });
  }

  if (!comment || !user) return (<></>)

  return (
    <Card css={css`overflow: visible;`} shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex align="center" justify="space-between">
        <Flex miw={0}>
          <Flex miw={0}>
            <Text truncate pr={4}>{user.name}</Text>
            <Text>@</Text>
            <Text truncate>{user.username}</Text>
          </Flex>
          <Text ml={4} title={date(comment.date).format('lll')}>
            {date(comment.date).fromNow()}
          </Text>
        </Flex>
        <Menu shadow="md" radius="md">
          <Menu.Target>
            <ActionIcon color="dark"><IconDots /></ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {user.id === currentUserId &&
              <>
                <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={deleteComment}>
                  delete argument
                </Menu.Item>
              </>
            }
          </Menu.Dropdown>
        </Menu>
      </Flex>

      <Text>{comment.content}</Text>
    </Card>
  )
}

export default Comment