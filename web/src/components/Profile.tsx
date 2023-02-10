import { IUser } from "@api/types/user";
import { css } from "@emotion/react";
import { ActionIcon, Button, Card, Flex, Menu, Text, } from "@mantine/core";
import { IconCalendar, IconClipboardText, IconDots, IconShare, IconUsers } from "@tabler/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { date } from "../lib/date";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { wrapContent } from "../styles/css";
import TextParser from "./TextParser";
import { util } from "../lib/util";

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

  const gotoFollowers = () => {
    const target = `/profile/${user.username}/followers`;
    if (location.pathname !== target) navigate(target);
  }

  const gotoFollowing = () => {
    const target = `/profile/${user.username}/following`;
    if (location.pathname !== target) navigate(target);
  }

  const followUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  const share = () => {
    util.share(
      `Profile`,
      `${user.name} @${user.username}`,
      `https://forum.dorkodu.com/profile/${user.username}`
    )
  }

  const copyToClipboard = () => {
    util.copyToClipboard(`https://forum.dorkodu.com/profile/${user.username}`);
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

      <Flex direction="column" align="flex-start">
        <Text onClick={gotoFollowers}>
          {t("user.followers", { count: user.followerCount })}
        </Text>

        <Text onClick={gotoFollowing}>
          {t("user.following", { count: user.followingCount })}
        </Text>
      </Flex>

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

export default Profile