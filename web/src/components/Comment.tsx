import { css } from "@emotion/react";
import { Card, Flex, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { date } from "../lib/date";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { autoGrid, nowrap, wrapContent } from "../styles/css";
import CommentMenu from "./menus/CommentMenu";
import TextParser, { PieceType } from "./TextParser";

interface Props {
  commentId: string;
}

function Comment({ commentId }: Props) {
  const navigate = useNavigate();
  const comment = useDiscussionStore(state => state.getComment(commentId));
  const user = useUserStore(state => state.getUserById(comment?.userId));

  const gotoUser = () => {
    if (!user) return;
    navigate(`/profile/${user.username}`);
  }

  if (!comment || !user) return (<></>)

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
          <Text css={nowrap} mr={4} title={date(comment.date).format('lll')}>
            {date(comment.date).fromNow()}
          </Text>
        </Flex>

        <CommentMenu user={user} comment={comment} />
      </Flex>

      <Text css={wrapContent}>
        <TextParser text={comment.content} />
      </Text>
    </Card>
  )
}

export default Comment