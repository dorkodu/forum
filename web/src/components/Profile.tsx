import { IUser } from "@api/types/user";
import { css } from "@emotion/react";
import { Anchor, Button, Card, Flex, Text, useMantineTheme, } from "@mantine/core";
import { IconCalendar, IconHandOff, IconUsers } from "@tabler/icons";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { date } from "../lib/date";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { colorBW, wrapContent } from "../styles/css";
import TextParser, { PieceType } from "./TextParser";
import UserMenu from "./menus/UserMenu";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
}

function Profile({ user }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const theme = useMantineTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const currentUserId = useAuthStore(state => state.userId);

  const gotoFollowers = (ev: MouseEvent) => {
    ev.preventDefault();

    const target = `/profile/${user.username}/followers`;
    if (location.pathname !== target) navigate(target);
  }

  const gotoFollowing = (ev: MouseEvent) => {
    ev.preventDefault();

    const target = `/profile/${user.username}/following`;
    if (location.pathname !== target) navigate(target);
  }

  const followUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <Card css={css`overflow: visible;`} shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="xs">
        <Flex direction="column">
          <Flex justify="space-between" gap="xs">
            <Flex align="center">
              <Text css={wrapContent}>
                <TextParser text={user.name} types={[PieceType.Emoji]} />
              </Text>
            </Flex>

            <Flex align="flex-start"><UserMenu user={user} /></Flex>
          </Flex>

          <Text css={wrapContent}>@{user.username}</Text>
        </Flex>

        {user.bio.length !== 0 &&
          <Text css={wrapContent}><TextParser text={user.bio} /></Text>
        }

        <Flex align="center" gap="xs">
          <IconCalendar />
          {date(user.joinDate).format('ll')}
        </Flex>

        <Flex direction="row" wrap="wrap">
          <Anchor href={`/profile/${user.username}/followers`} css={colorBW(theme)} onClick={gotoFollowers} mr="xs">
            {t("user.followers", { count: user.followerCount })}
          </Anchor>

          <Anchor href={`/profile/${user.username}/following`} css={colorBW(theme)} onClick={gotoFollowing}>
            {t("user.following", { count: user.followingCount })}
          </Anchor>
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
    </Card>
  )
}

export default Profile