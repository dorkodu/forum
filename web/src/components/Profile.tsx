import { IUser } from "@api/types/user";
import { css } from "@emotion/react";
import { ActionIcon, Button, Card, Flex, Menu, Text, Textarea, TextInput } from "@mantine/core";
import { IconCalendar, IconDots, IconEdit, IconUsers } from "@tabler/icons";
import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"
import { date } from "../lib/date";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";

interface Props {
  user: IUser;
}

interface State {
  name: string;
  bio: string;

  editing: boolean;

  loading: boolean;
  status: boolean | undefined;
}

function Profile({ user }: Props) {
  const [state, setState] = useReducer(
    (prev: State, next: State) => {
      const newState = { ...prev, ...next };

      if (newState.name.length > 64)
        newState.name = newState.name.substring(0, 64);

      if (newState.bio.length > 500)
        newState.bio = newState.bio.substring(0, 500);

      return newState;
    },
    { name: "", bio: "", editing: false, loading: false, status: undefined }
  )

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryFollowUser = useUserStore(state => state.queryFollowUser);
  const queryEditUser = useUserStore(state => state.queryEditUser);
  const currentUserId = useAuthStore(state => state.userId);

  const followUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryFollowUser(user);
    setState({ ...state, loading: false, status: status });
  }

  const editUser = async () => {
    if (state.loading) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await queryEditUser(state.name, state.bio);
    setState({ ...state, loading: false, status: status });
  }

  const startEdit = () => {
    setState({ ...state, name: user.name, bio: user.bio, editing: true })
  }

  const stopEdit = async (saveChanges: boolean) => {
    if (saveChanges) await editUser();
    setState({ ...state, editing: false });
  }

  return (
    <Card css={css`overflow: visible;`} shadow="sm" p="lg" m="md" radius="md" withBorder>
      {state.editing &&
        <TextInput
          radius="md"
          placeholder={t("profileName")}
          disabled={state.loading}
          defaultValue={state.name}
          onChange={(ev) => { setState({ ...state, name: ev.target.value }) }}
        />
      }
      {!state.editing &&
        <Flex align="center" justify="space-between">
          <Text>{user.name}</Text>

          <Menu shadow="md" radius="md">
            <Menu.Target>
              <ActionIcon color="dark" onClick={(ev) => { ev.stopPropagation() }}>
                <IconDots />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {user.id === currentUserId &&
                <>
                  <Menu.Item icon={<IconEdit size={14} />} onClick={startEdit}>
                    {t("editProfile")}
                  </Menu.Item>
                </>
              }
            </Menu.Dropdown>
          </Menu>
        </Flex>
      }

      <Text>@{user.username}</Text>

      {state.editing &&
        <Textarea
          radius="md"
          placeholder={t("profileBio")}
          defaultValue={state.bio}
          onChange={(ev) => { setState({ ...state, bio: ev.target.value }) }}
          autosize
          pb="md"
        />
      }
      {!state.editing && <Text css={css`word-wrap: break-word;`}>{user.bio}</Text>}

      <Flex align="center">
        <IconCalendar />
        {date(user.joinDate).format('ll')}
      </Flex>

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

      {user.id === currentUserId && state.editing &&
        <Flex align="center" gap="xs">
          <Button onClick={() => stopEdit(true)} color="dark" radius="md">{t("confirm")}</Button>
          <Button onClick={() => stopEdit(false)} color="dark" radius="md">{t("cancel")}</Button>
        </Flex>
      }

      {user.following && <Flex><IconUsers />{t("userFollowsYou")}</Flex>}
    </Card>
  )
}

export default Profile