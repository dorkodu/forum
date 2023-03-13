import { IUser } from "@api/types/user";
import { Button, Flex, Text } from "@mantine/core";
import { IconHandOff, IconUsers } from "@tabler/icons-react";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { util } from "../lib/util";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import UserMenu from "./menus/UserMenu";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function ProfileSummary({ user }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const currentUserId = useAuthStore(state => state.userId);

  const gotoUser = (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    navigate(`/profile/${user.username}`);
  }

  const followUser = async (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <CardEntity
      user={user}
      entity={{ content: user.bio }}

      onClickUser={gotoUser}
      onClickCard={gotoUser}

      componentMenu={<UserMenu user={user} />}
      componentBottom={
        <Flex direction="column" gap={4}>
          <Flex direction="row" wrap="wrap">
            <Text mr="xs">
              {t("user.followers", { count: user.followerCount, number: util.formatNumber(user.followerCount) })}
            </Text>

            <Text>
              {t("user.following", { count: user.followingCount, number: util.formatNumber(user.followingCount) })}
            </Text>
          </Flex>

          {user.following &&
            <Flex align="center" gap="xs">
              <IconUsers />{t("user.followsYou")}
            </Flex>
          }

          {(user.blocking || user.blocker) &&
            <Flex align="center" gap="xs">
              <IconHandOff />
              {user.blocking && user.blocker && t("user.blockBoth")}
              {!user.blocking && user.blocker && t("user.blocker")}
              {user.blocking && !user.blocker && t("user.blocking")}
            </Flex>
          }

          {user.id !== currentUserId &&
            <Flex justify="flex-end">
              <Button onClick={followUser} color="dark" radius="md">
                {user.follower ? t("user.unfollow") : t("user.follow")}
              </Button>
            </Flex>
          }
        </Flex>
      }
    />
  )
}

export default ProfileSummary