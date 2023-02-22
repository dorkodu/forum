import { IUser } from "@api/types/user";
import { css } from "@emotion/react";
import { Anchor, Button, Card, Flex, Text, useMantineTheme } from "@mantine/core";
import { IconHandOff, IconUsers } from "@tabler/icons";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { autoGrid, bgColorHover, colorBW, wrapContent } from "../styles/css";
import UserMenu from "./menus/UserMenu";
import TextParser, { PieceType } from "./TextParser";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function ProfileSummary({ user }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const theme = useMantineTheme();
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
    <Card css={css`overflow: visible; ${bgColorHover(theme)}`} shadow="sm" p="lg" m="md" radius="md" withBorder onClick={gotoUser}>
      <Flex direction="column" gap={4}>
        <Flex direction="column">
          <Flex align="center" justify="space-between">
            <Anchor href={`/profile/${user.username}`} css={colorBW(theme)} onClick={gotoUser}>
              <Flex miw={0} css={autoGrid}>
                <Text truncate mr={4}><TextParser text={user.name} types={[PieceType.Emoji]} /></Text>
                <Text>@</Text>
                <Text truncate>{user.username}</Text>
              </Flex>
            </Anchor>

            <UserMenu user={user} />
          </Flex>

          {user.bio.length !== 0 &&
            <Text css={wrapContent}><TextParser text={user.bio} /></Text>
          }
        </Flex>

        <Flex direction="row" wrap="wrap">
          <Text mr="xs">
            {t("user.followers", { count: user.followerCount })}
          </Text>

          <Text>
            {t("user.following", { count: user.followingCount })}
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
    </Card >
  )
}

export default ProfileSummary