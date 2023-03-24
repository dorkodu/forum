import { IComment } from "@/types/comment";
import { IUser } from "@/types/user";
import { ActionIcon, Menu } from "@mantine/core"
import { IconClipboardText, IconDots, IconShare, IconTrash } from "@tabler/icons-react"
import { MouseEvent, useState } from "react";
import { useTranslation } from "next-i18next";
import { util } from "@/lib/web/util";
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

  const share = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.share(
      comment.content.length > 100 ? `${comment.content.substring(0, 100)}...` : comment.content,
      `https://forum.dorkodu.com/discussion/${comment.discussionId}?comment=${comment.id}`
    )
  }

  const copyToClipboard = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.copyToClipboard(`https://forum.dorkodu.com/discussion/${comment.discussionId}?comment=${comment.id}`);
  }

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
        <Menu.Item
          icon={<IconShare size={14} />}
          onClick={share}
        >
          {t("share")}
        </Menu.Item>

        <Menu.Item
          icon={<IconClipboardText size={14} />}
          onClick={copyToClipboard}
        >
          {t("copyToClipboard")}
        </Menu.Item>

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