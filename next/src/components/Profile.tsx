import { IUser } from "@/types/user";
import { Anchor, Avatar, Button, Card, Flex, Text, useMantineTheme, } from "@mantine/core";
import { IconCalendar, IconHandOff, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import { colorBW, wrapContent } from "../styles/css";
import TextParser, { PieceType } from "./TextParser";
import UserMenu from "./menus/UserMenu";
import { util } from "@/lib/web/util";
import AvatarWebp from "../assets/avatar.webp";
import CustomTooltip from "./custom/CustomTooltip";
import CustomLink from "./custom/CustomLink";
import { useRouter } from "next/router";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
}

function Profile({ user }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const router = useRouter();
  const theme = useMantineTheme();
  const { t } = useTranslation();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const currentUserId = useAuthStore(state => state.userId);

  const followUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <Card sx={{ overflow: "visible" }} shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="xs">
        <Flex direction="row" justify="space-between">
          <Avatar src={AvatarWebp.src} size={100} radius="md" />
          <UserMenu user={user} />
        </Flex>

        <Flex direction="column">
          <Flex direction="column">
            <Text size="xl" weight={600} sx={wrapContent}>
              <TextParser text={user.name} types={[PieceType.Emoji]} />
            </Text>

            <Flex>
              <Text style={{ fontWeight: 750 }}>@</Text>
              <Text weight={500} sx={wrapContent}>{user.username}</Text>
            </Flex>
          </Flex>

          {user.bio.length !== 0 &&
            <Text size="sm" color="dimmed" sx={wrapContent}><TextParser text={user.bio} /></Text>
          }
        </Flex>

        <Flex align="center" gap="xs">
          <IconCalendar />
          {new Intl.DateTimeFormat(router.locale, { dateStyle: "medium" }).format(user.joinDate)}
        </Flex>

        <Flex direction="row" wrap="wrap">
          <CustomTooltip label={util.formatNumber(router.locale, user.followerCount, true)}>
            <CustomLink href={`/profile/${user.username}/followers`}>
              <Anchor sx={colorBW(theme)} component="div" mr="xs">
                {t("user.followers", { count: user.followerCount, number: util.formatNumber(router.locale, user.followerCount) })}
              </Anchor>
            </CustomLink>
          </CustomTooltip>

          <CustomTooltip label={util.formatNumber(router.locale, user.followingCount, true)}>
            <CustomLink href={`/profile/${user.username}/following`}>
              <Anchor sx={colorBW(theme)} component="div">
                {t("user.following", { count: user.followingCount, number: util.formatNumber(router.locale, user.followingCount) })}
              </Anchor>
            </CustomLink>
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