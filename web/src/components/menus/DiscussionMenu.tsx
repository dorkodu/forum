import { IDiscussion } from "@api/types/discussion";
import { IUser } from "@api/types/user";
import { ActionIcon, Menu } from "@mantine/core"
import { IconClipboardText, IconDots, IconEdit, IconShare, IconTrash } from "@tabler/icons"
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { util } from "../../lib/util";
import { useAuthStore } from "../../stores/authStore";
import { useDiscussionStore } from "../../stores/discussionStore";

interface Props {
  user: IUser;
  discussion: IDiscussion;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
}

function DiscussionMenu({ user, discussion }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryDeleteDiscussion = useDiscussionStore(state => state.queryDeleteDiscussion);
  const currentUserId = useAuthStore(state => state.userId);

  const onClick = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
  }

  const share = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.share(
      `Discussion`,
      `${discussion.title}`,
      `https://forum.dorkodu.com/discussion/${discussion.id}`
    )
  }

  const copyToClipboard = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.copyToClipboard(`https://forum.dorkodu.com/discussion/${discussion.id}`);
  }

  const gotoDiscussionEditor = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    navigate(`/discussion-editor/${discussion.id}`);
  }

  const deleteDiscussion = async (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteDiscussion(discussion);
    setState({ ...state, loading: false, status: status });

    // Redirect to home after successfully deleting the discussion
    if (status) navigate("/home");
  }

  return (
    <Menu shadow="md" radius="md" position="bottom-end">
      <Menu.Target>
        <ActionIcon color="dark" onClick={onClick}>
          <IconDots />
        </ActionIcon>
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
            <Menu.Divider />

            <Menu.Item icon={<IconEdit size={14} />} onClick={gotoDiscussionEditor}>
              {t("discussion.edit")}
            </Menu.Item>

            <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={deleteDiscussion}>
              {t("discussion.delete")}
            </Menu.Item>
          </>
        }
      </Menu.Dropdown>
    </Menu>
  )
}

export default DiscussionMenu