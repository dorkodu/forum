import { IArgument } from "@api/types/argument";
import { IUser } from "@api/types/user";
import { ActionIcon, Menu } from "@mantine/core"
import { IconDots, IconTrash } from "@tabler/icons"
import { useState } from "react";
import { useTranslation } from "react-i18next";
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

  const deleteArgument = async () => {
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