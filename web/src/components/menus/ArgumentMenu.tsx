import { IArgument } from "@api/types/argument";
import { IUser } from "@api/types/user";
import { ActionIcon, Menu } from "@mantine/core"
import { IconClipboardText, IconDots, IconShare, IconTrash } from "@tabler/icons-react"
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { util } from "../../lib/util";
import { useAuthStore } from "../../stores/authStore";
import { useDiscussionStore } from "../../stores/discussionStore";

interface Props {
  user: IUser;
  argument: IArgument;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function ArgumentMenu({ user, argument }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const { t } = useTranslation();
  const queryDeleteArgument = useDiscussionStore(state => state.queryDeleteArgument);
  const currentUserId = useAuthStore(state => state.userId);

  const share = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.share(
      argument.content.length > 100 ? `${argument.content.substring(0, 100)}...` : argument.content,
      `https://forum.dorkodu.com/discussion/${argument.discussionId}?argument=${argument.id}`
    )
  }

  const copyToClipboard = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.copyToClipboard(`https://forum.dorkodu.com/discussion/${argument.discussionId}?argument=${argument.id}`);
  }

  const deleteArgument = async (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (!argument) return;
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryDeleteArgument(argument);
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
            <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={deleteArgument}>
              {t("argument.delete")}
            </Menu.Item>
          </>
        }
      </Menu.Dropdown>
    </Menu>
  )
}

export default ArgumentMenu