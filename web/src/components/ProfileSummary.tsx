import { IUser } from "@api/types/user";
import { Button, Card, Flex, Text } from "@mantine/core";
import { IconUsers } from "@tabler/icons";
import { MouseEvent, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { wrapContent } from "../styles/css";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function ProfileSummary({ user }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => ({ ...prev, ...next }),
    { loading: false, status: undefined }
  )

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const currentUserId = useAuthStore(state => state.userId);

  const gotoUser = () => {
    navigate(`/profile/${user.username}`)
  }

  const followUser = async (ev: MouseEvent) => {
    ev.stopPropagation();

    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder onClick={gotoUser}>
      <Flex miw={0}>
        <Text truncate pr={4}>{user.name}</Text>
        <Text>@</Text>
        <Text truncate>{user.username}</Text>
      </Flex>

      <Text css={wrapContent}>{user.bio}</Text>

      <Flex align="center" justify="space-between">
        <Flex align="center" gap="xs">
          <Text onClick={() => navigate(`/profile/${user.username}/followers`)}>
            {t("userFollowers", { count: user.followerCount })}
          </Text>
          <Text onClick={() => navigate(`/profile/${user.username}/following`)}>
            {t("userFollowing", { count: user.followingCount })}
          </Text>
        </Flex>
        {user.id !== currentUserId &&
          <Button onClick={followUser} color="dark" radius="md">
            {user.follower ? t("unfollowUser") : t("followUser")}
          </Button>
        }
      </Flex>

      {user.following && <Flex><IconUsers />{t("userFollowsYou")}</Flex>}
    </Card>
  )
}

export default ProfileSummary