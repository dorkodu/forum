import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { ActionIcon, AppShell, Card, CSSObject, Flex, Footer, Header, Indicator } from "@mantine/core";
import { IconArrowLeft, IconBell, IconHome, IconMenu2, IconPencilPlus, IconSearch, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/router";
import ForumIcon from "@/../public/forum.svg";
import CustomLink from "../custom/CustomLink";

const width = { maxWidth: "768px", margin: "0 auto" } satisfies CSSObject
const height100 = { height: "100%" } satisfies CSSObject

function DefaultLayout({ children }: React.PropsWithChildren) {
  return (
    <AppShell padding={0} header={<DefaultHeader />} footer={<DefaultFooter />}>
      {children}
    </AppShell>
  );
}

export default DefaultLayout

function DefaultHeader() {
  const router = useRouter();

  return (
    <Header sx={width} px="md" pt="md" height={64} withBorder={false}>
      <Card sx={height100} shadow="sm" radius="md" withBorder>
        <Flex sx={height100} align="center" justify="space-between">
          <ActionIcon
            color="dark"
            onClick={() => router.back()}
            sx={router.pathname === "/home" ? { visibility: "hidden" } : undefined}>
            <IconArrowLeft />
          </ActionIcon>

          <CustomLink href="/">
            <ActionIcon size={28}>
              <img
                src={ForumIcon.src} alt="Forum"
                width={28} height={28}
                draggable={false}
              />
            </ActionIcon>
          </CustomLink>

          <CustomLink href="/menu">
            <ActionIcon color={router.pathname === "/menu" ? "green" : "dark"}>
              <IconMenu2 />
            </ActionIcon>
          </CustomLink>
        </Flex>
      </Card>
    </Header>
  )
}

function DefaultFooter() {
  const router = useRouter();
  const currentUserId = useAuthStore(state => state.userId);
  const currentUser = useUserStore(state => state.getUserById(currentUserId));

  return (
    <Footer sx={width} px="md" pb="md" height={64} withBorder={false}>
      <Card sx={height100} shadow="sm" p="md" radius="md" withBorder>
        <Flex sx={height100} align="center" justify="space-evenly">
          <ActionIcon color={router.pathname === "/home" ? "green" : "dark"}>
            <IconHome />
          </ActionIcon>
          <ActionIcon color={router.pathname === "/search" ? "green" : "dark"}>
            <IconSearch />
          </ActionIcon>
          <ActionIcon color={router.pathname === "/profile" ? "green" : "dark"}>
            <IconUser />
          </ActionIcon>

          {/* 
            Set indicator z-index to 101 (1 higher than appshell's footer).
            Causes rendering order bug in SM-M236B Android 12 (and other?).
          */}
          <Indicator color="red" disabled={!currentUser?.hasNotification} zIndex={101}>
            <ActionIcon color={router.pathname === "/notifications" ? "green" : "dark"} >
              <IconBell />
            </ActionIcon>
          </Indicator>

          <ActionIcon color={router.pathname.startsWith("/discussion-editor") ? "green" : "dark"} >
            <IconPencilPlus />
          </ActionIcon>
        </Flex>
      </Card>
    </Footer>
  )
}