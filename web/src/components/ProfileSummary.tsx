import { IUser } from "@api/types/user";
import { Button, Card, Flex, Text } from "@mantine/core";
import { IconUsers } from "@tabler/icons";
import { MouseEvent, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { autoGrid, wrapContent } from "../styles/css";
import TextParser from "./TextParser";

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
      <Flex miw={0} css={autoGrid} justify="flex-start">
        <Text truncate mr={4}>{user.name}</Text>
        <Text>@</Text>
        <Text truncate>{user.username}</Text>
      </Flex>

      <Text css={wrapContent}><TextParser text={user.bio} /></Text>

      <Text>
        {t("user.followers", { count: user.followerCount })}
      </Text>

      <Text >
        {t("user.following", { count: user.followingCount })}
      </Text>

      <Flex justify="space-between">
        {user.following &&
          <Flex align="center" gap="xs">
            <IconUsers />{t("user.followsYou")}
          </Flex>
        }

        <Flex align="flex-end">
          {user.id !== currentUserId &&
            <Button onClick={followUser} color="dark" radius="md">
              {user.follower ? t("user.unfollow") : t("user.follow")}
            </Button>
          }
        </Flex>
      </Flex>
    </Card>
  )
}

export default ProfileSummary