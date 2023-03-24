import { IUser } from "@/types/user";
import { Button, Flex, Text } from "@mantine/core";
import { IconHandOff, IconUsers } from "@tabler/icons-react";
import { MouseEvent, useState } from "react";
import { useTranslation } from "next-i18next";
import { util } from "@/lib/web/util";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";
import CardEntity from "./cards/CardEntity";
import UserMenu from "./menus/UserMenu";
import { useRouter } from "next/router";
import CustomLink from "./custom/CustomLink";

interface Props {
  user: IUser;
}

interface State {
  loading: boolean,
  status: boolean | undefined,
}

function ProfileSummary({ user }: Props) {
  const [state, setState] = useState<State>({ loading: false, status: undefined });

  const router = useRouter();
  const { t } = useTranslation();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const currentUserId = useAuthStore(state => state.userId);

  const followUser = async (ev: MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();

    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  return (
    <CustomLink href={`/profile/${user.username}`}>
      <CardEntity
        user={user}
        entity={{ content: user.bio }}

        componentMenu={<UserMenu user={user} />}
        componentBottom={
          <Flex direction="column" gap={4}>
            <Flex direction="row" wrap="wrap">
              {/*No need for a CustomTooltip here, since clicking the component will change the route.*/}
              <Text mr="xs">
                {t("user.followers", { count: user.followerCount, number: util.formatNumber(router.locale, user.followerCount) })}
              </Text>

              {/*No need for a CustomTooltip here, since clicking the component will change the route.*/}
              <Text>
                {t("user.following", { count: user.followingCount, number: util.formatNumber(router.locale, user.followingCount) })}
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
    </CustomLink>
  )
}

export default ProfileSummary