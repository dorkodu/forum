import { IUser } from "@api/types/user";
import { css } from "@emotion/react";
import { ActionIcon, Button, Card, Flex, Menu, Text, } from "@mantine/core";
import { IconCalendar, IconDots, IconUsers } from "@tabler/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { date } from "../lib/date";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { wrapContent } from "../styles/css";
import TextParser from "./TextParser";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
}

function Profile({ user }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const currentUserId = useAuthStore(state => state.userId);

  const followUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <Card css={css`overflow: visible;`} shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex justify="space-between" gap="xs">
        <Flex align="center">
          <Text css={wrapContent}>{user.name}</Text>
        </Flex>

        <Flex align="flex-start">
          <Menu shadow="md" radius="md" position="bottom-end">
            <Menu.Target>
              <ActionIcon color="dark" onClick={(ev) => { ev.stopPropagation() }}>
                <IconDots />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>

      <Text css={wrapContent}>@{user.username}</Text>

      <Text css={wrapContent}>
        <TextParser text={user.bio} />
      </Text>

      <Flex align="center">
        <IconCalendar />
        {date(user.joinDate).format('ll')}
      </Flex>

      <Text onClick={() => navigate(`/profile/${user.username}/followers`)}>
        {t("userFollowers", { count: user.followerCount })}
      </Text>

      <Text onClick={() => navigate(`/profile/${user.username}/following`)}>
        {t("userFollowing", { count: user.followingCount })}
      </Text>

      <Flex justify="space-between">
        {user.following &&
          <Flex align="center" gap="xs">
            <IconUsers />{t("userFollowsYou")}
          </Flex>
        }

        <Flex align="flex-end">
          {user.id !== currentUserId &&
            <Button onClick={followUser} color="dark" radius="md">
              {user.follower ? t("unfollowUser") : t("followUser")}
            </Button>
          }
        </Flex>
      </Flex>
    </Card>
  )
}

export default Profile