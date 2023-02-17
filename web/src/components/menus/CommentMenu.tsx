import { IComment } from "@api/types/comment";
import { IUser } from "@api/types/user";
import { ActionIcon, Menu } from "@mantine/core"
import { IconDots, IconTrash } from "@tabler/icons"
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/authStore";
import { useDiscussionStore } from "../../stores/discussionStore";

interface Props {
  user: IUser;
  comment: IComment;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function CommentMenu({ user, comment }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const { t } = useTranslation();
  const queryDeleteComment = useDiscussionStore(state => state.queryDeleteComment);
  const currentUserId = useAuthStore(state => state.userId);

  const deleteComment = async (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!comment) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteComment(comment);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <Menu shadow="md" radius="md" position="bottom-end">
      <Menu.Target>
        <ActionIcon color="dark"><IconDots /></ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {user.id === currentUserId &&
          <>
            <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={deleteComment}>
              {t("comment.delete")}
            </Menu.Item>
          </>
        }
      </Menu.Dropdown>
    </Menu>
  )
}

export default CommentMenu