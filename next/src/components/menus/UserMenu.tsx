import { IUser } from "@/types/user";
import { ActionIcon, Menu } from "@mantine/core"
import { IconClipboardText, IconDots, IconHandOff, IconHandStop, IconShare } from "@tabler/icons-react"
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { util } from "@/lib/web/util";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
}

function UserMenu({ user }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const { t } = useTranslation();
  const queryBlockUser = useUserStore(state => state.queryBlockUser);
  const currentUserId = useAuthStore(state => state.userId);

  const onClick = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
  }

  const share = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.share(
      `${user.name} @${user.username}`,
      `https://forum.dorkodu.com/profile/${user.username}`
    )
  }

  const copyToClipboard = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    util.copyToClipboard(`https://forum.dorkodu.com/profile/${user.username}`);
  }

  const blockUser = async (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryBlockUser(user);
    setState({ ...state, loading: false, status: status });
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

        {user.id !== currentUserId &&
          <>
            <Menu.Divider />

            <Menu.Item
              icon={user.blocker ? <IconHandStop size={14} /> : <IconHandOff size={14} />}
              onClick={blockUser}
              color="red"
            >
              {user.blocker ? t("user.unblock") : t("user.block")}
            </Menu.Item>
          </>
        }
      </Menu.Dropdown>
    </Menu>
  )
}

export default UserMenu