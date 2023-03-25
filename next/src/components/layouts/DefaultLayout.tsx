import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { ActionIcon, AppShell, Button, Card, createStyles, CSSObject, Flex, Footer, Header, Indicator, MantineTheme, MediaQuery, Text, useMantineTheme } from "@mantine/core";
import { IconArrowLeft, IconBell, IconHome, IconMenu2, IconPencilPlus, IconSearch, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/router";
import CustomLink from "../custom/CustomLink";
import Image from "next/image";
import ForumBrandLight from "@/../public/forum_brand-light.svg";
import ForumBrandDark from "@/../public/forum_brand-dark.svg";

const height100 = { height: "100%" } satisfies CSSObject
const width = (theme: MantineTheme) => ({
  maxWidth: theme.breakpoints.lg,
  margin: "0 auto"
}) satisfies CSSObject

const useStyles = createStyles((_theme) => ({
  footer: {
    display: "none",

    [`@media (max-width: 640px)`]: {
      display: "block",
    },
  },
  navbar: {
    width: 300,
    flexShrink: 0,

    [`@media (max-width: 1080px)`]: {
      width: 64,
    },

    [`@media (max-width: 640px)`]: {
      display: "none",
    },
  },
  aside: {
    width: 300,
    flexShrink: 0,

    [`@media (max-width: 960px)`]: {
      width: 200,
    },

    [`@media (max-width: 768px)`]: {
      display: "none",
    },
  },
  maxWidth: {

  },
  minWidth: {

  }
}))

export default function DefaultLayout({ children }: React.PropsWithChildren) {
  return (
    <AppShell
      header={<DefaultHeader />}
      footer={<DefaultFooter />}
      padding={0}
    >
      <Flex direction="row">
        <DefaultNavbar />
        <Flex direction="column" style={{ flexGrow: 1 }}>{children}</Flex>
        <DefaultAside />
      </Flex>
    </AppShell>
  );
}

function DefaultHeader() {
  const router = useRouter();
  const theme = useMantineTheme();
  const image = theme.colorScheme === "light" ? ForumBrandDark : ForumBrandLight;

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
            <ActionIcon w={image.width / 7.5} h={image.height / 7.5}>
              <Image
                src={image.src}
                alt="Forum"
                width={image.width / 7.5} height={image.height / 7.5}
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
  const { classes } = useStyles();
  const router = useRouter();
  const currentUserId = useAuthStore(state => state.userId);
  const currentUser = useUserStore(state => state.getUserById(currentUserId));

  return (
    <Footer className={classes.footer} sx={width} px="md" pb="md" height={64} withBorder={false}>
      <Card sx={height100} shadow="sm" p="md" radius="md" withBorder>
        <Flex sx={height100} align="center" justify="space-evenly">

          <CustomLink href="/">
            <ActionIcon color={router.pathname === "/" ? "green" : "dark"}>
              <IconHome />
            </ActionIcon>
          </CustomLink>

          <CustomLink href="/search">
            <ActionIcon color={router.pathname === "/search" ? "green" : "dark"}>
              <IconSearch />
            </ActionIcon>
          </CustomLink>

          <CustomLink href={`/profile/${currentUser?.username}`}>
            <ActionIcon color={router.pathname === "/profile" ? "green" : "dark"}>
              <IconUser />
            </ActionIcon>
          </CustomLink>


          <CustomLink href="/notifications">
            {/* 
              Set indicator z-index to 101 (1 higher than appshell's footer).
              Causes rendering order bug in SM-M236B Android 12 (and other?).
            */}
            <Indicator color="red" disabled={!currentUser?.hasNotification} zIndex={101}>
              <ActionIcon color={router.pathname === "/notifications" ? "green" : "dark"} >
                <IconBell />
              </ActionIcon>
            </Indicator>
          </CustomLink>

          <CustomLink href="/discussion-editor">
            <ActionIcon color={router.pathname.startsWith("/discussion-editor") ? "green" : "dark"} >
              <IconPencilPlus />
            </ActionIcon>
          </CustomLink>

        </Flex>
      </Card>
    </Footer>
  )
}

function DefaultNavbar() {
  const { classes } = useStyles();
  const currentUserId = useAuthStore(state => state.userId);
  const currentUser = useUserStore(state => state.getUserById(currentUserId));

  return (
    <Flex direction="column" w={300} className={classes.navbar}>
      <Flex direction="column" py="md" pl="md" gap="xs">
        <ButtonNavbar icon={<IconHome />} path={"/"} name={"Home"} />
        <ButtonNavbar icon={<IconSearch />} path={"/search"} name={"Search"} />
        <ButtonNavbar icon={<IconUser />} path={`/profile/${currentUser?.username}`} name={"Profile"} />
        <ButtonNavbar icon={<IconBell />} path={"/notifications"} name={"Notifications"} />
        <ButtonNavbar icon={<IconPencilPlus />} path={"/discussion-editor"} name={"Discussion Editor"} />
      </Flex>
    </Flex>
  )
}

function DefaultAside() {
  const { classes } = useStyles();

  return (
    <Flex direction="column" w={300} className={classes.aside}>
      aside
    </Flex>
  )
}

interface ButtonProps {
  icon: React.ReactNode;
  path: string;
  name: string;
}

function ButtonNavbar({ icon, path, name }: ButtonProps) {
  return (
    <>
      <MediaQuery query="(max-width: 1080px)" styles={{ display: 'none' }}>
        <ButtonDesktop icon={icon} name={name} path={path} />
      </MediaQuery>

      <MediaQuery query="(max-width: 1080px)" styles={{ display: 'block !important' }}>
        <ButtonMobile icon={icon} path={path} style={{ display: "none" }} />
      </MediaQuery>
    </>
  )
}

interface ButtonDesktopProps extends React.ComponentPropsWithoutRef<"button"> {
  icon: React.ReactNode;
  path: string;
  name: string;
}

function ButtonDesktop({ icon, path, name, ...props }: ButtonDesktopProps) {
  const theme = useMantineTheme();

  return (
    <Button {...props} styles={{ label: { display: "flex", gap: theme.spacing.md, flexGrow: 1 } }} fullWidth variant="subtle">
      {icon}
      <Text truncate>{name}</Text>
    </Button>
  )
}

interface ButtonMobileProps extends React.ComponentPropsWithoutRef<"a"> {
  icon: React.ReactNode;
  path: string;
}

function ButtonMobile({ icon, path, style, ...props }: ButtonMobileProps) {
  const router = useRouter();
  const theme = useMantineTheme();

  return (
    <CustomLink
      {...props}
      href={path}
      style={{ marginLeft: theme.spacing.md, width: "32px", height: "32px", ...style }}
    >
      <ActionIcon size={32} color={router.pathname === path ? "green" : "dark"}>
        {icon}
      </ActionIcon>
    </CustomLink>
  )
}