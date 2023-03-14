import { IUser } from "@api/types/user";
import { css } from "@emotion/react";
import { Anchor, Avatar, Button, Card, Flex, Text, useMantineTheme, } from "@mantine/core";
import { IconCalendar, IconHandOff, IconUsers } from "@tabler/icons-react";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { date } from "../lib/date";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { colorBW, wrapContent } from "../styles/css";
import TextParser, { PieceType } from "./TextParser";
import UserMenu from "./menus/UserMenu";
import { util } from "../lib/util";
import AvatarWebp from "../assets/avatar.webp";
import { tokens } from "@dorkodu/prism";
import CustomTooltip from "./custom/CustomTooltip";

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
        <Flex direction="row" justify="space-between">
          <Avatar src={AvatarWebp} size={100} radius="md" />
          <UserMenu user={user} />
        </Flex>

        <Flex direction="column">
          <Flex direction="column">
            <Text size="xl" weight={600} css={wrapContent}>
              <TextParser text={user.name} types={[PieceType.Emoji]} />
            </Text>

            <Flex>
              <Text style={{ color: tokens.color.gray(50), fontWeight: 750 }}>@</Text>
              <Text weight={500} css={wrapContent}>{user.username}</Text>
            </Flex>
          </Flex>

          {user.bio.length !== 0 &&
            <Text size="sm" color="dimmed" css={wrapContent}><TextParser text={user.bio} /></Text>
          }
        </Flex>

        <Flex align="center" gap="xs">
          <IconCalendar />
          {date(user.joinDate).format('ll')}
        </Flex>

        <Flex direction="row" wrap="wrap">
          <CustomTooltip label={util.formatNumber(user.followerCount, true)}>
            <Anchor href={`/profile/${user.username}/followers`} css={colorBW(theme)} onClick={gotoFollowers} mr="xs">
              {t("user.followers", { count: user.followerCount, number: util.formatNumber(user.followerCount) })}
            </Anchor>
          </CustomTooltip>

          <CustomTooltip label={util.formatNumber(user.followingCount, true)}>
            <Anchor href={`/profile/${user.username}/following`} css={colorBW(theme)} onClick={gotoFollowing}>
              {t("user.following", { count: user.followingCount, number: util.formatNumber(user.followingCount) })}
            </Anchor>
          </CustomTooltip>
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