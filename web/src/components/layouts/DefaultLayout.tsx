import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { ActionIcon, Anchor, AppShell, Button, Card, createStyles, Flex, Footer, Header, Indicator, MediaQuery, Text, useMantineTheme } from "@mantine/core";
import { IconArrowLeft, IconBell, IconHome, IconMenu2, IconPencilPlus, IconSearch, IconUser } from "@tabler/icons-react";
import RequestLogin from "../modals/RequestLogin";
import { useLocation, useNavigate } from "react-router-dom";
import ForumBrandLight from "@/assets/forum_brand-light.svg";
import ForumBrandDark from "@/assets/forum_brand-dark.svg";
import DorkoduLogo from "@/assets/dorkodu_logo.svg";
import { clickable } from "@/styles/css";

const useStyles = createStyles((theme) => ({
  header: {
    maxWidth: theme.breakpoints.lg,
    margin: "0 auto"
  },
  footer: {
    display: "none",
    maxWidth: theme.breakpoints.lg,
    margin: "0 auto",

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

    [`@media (max-width: 840px)`]: {
      width: 200,
    },

    [`@media (max-width: 768px)`]: {
      display: "none",
    },
  },
}))

export default function DefaultLayout({ children }: React.PropsWithChildren) {
  return (
    <>
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

      <RequestLogin />
    </>
  )
}

function DefaultHeader() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Header className={classes.header} px="md" pt="md" height={64} withBorder={false}>
      <Card sx={{ height: "100%" }} shadow="sm" radius="md" withBorder>
        <Flex sx={{ height: "100%" }} align="center" justify="space-between">
          <ActionIcon
            color="dark"
            onClick={() => navigate(-1)}
            sx={location.pathname === "/" ? { visibility: "hidden" } : undefined}>
            <IconArrowLeft />
          </ActionIcon>

          <img
            src={theme.colorScheme === "dark" ? ForumBrandLight : ForumBrandDark}
            alt="Forum"
            height={32}
            draggable={false}
            style={clickable}
            onClick={() => navigate("/home")}
          />

          <ActionIcon
            color={location.pathname === "/menu" ? "green" : "dark"}
            onClick={() => navigate("/menu")}
          >
            <IconMenu2 />
          </ActionIcon>
        </Flex>
      </Card>
    </Header>
  )
}

function DefaultFooter() {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = useAuthStore(state => state.userId);
  const currentUser = useUserStore(state => state.getUserById(currentUserId));

  return (
    <Footer className={classes.footer} px="md" pb="md" height={64} withBorder={false}>
      <Card sx={{ height: "100%" }} shadow="sm" p="md" radius="md" withBorder>
        <Flex sx={{ height: "100%" }} align="center" justify="space-evenly">

          <ActionIcon
            color={location.pathname === "/" ? "green" : "dark"}
            onClick={() => navigate("/home")}
          >
            <IconHome />
          </ActionIcon>

          <ActionIcon
            color={location.pathname === "/search" ? "green" : "dark"}
            onClick={() => navigate("/search")}
          >
            <IconSearch />
          </ActionIcon>

          <ActionIcon
            color={location.pathname === "/profile" ? "green" : "dark"}
            onClick={() => navigate(`/profile/${currentUser?.username}`)}
          >
            <IconUser />
          </ActionIcon>

          {/* 
            Set indicator z-index to 101 (1 higher than appshell's footer).
            Causes rendering order bug in SM-M236B Android 12 (and other?).
          */}
          <Indicator color="red" disabled={!currentUser?.hasNotification} zIndex={101}>
            <ActionIcon
              color={location.pathname === "/notifications" ? "green" : "dark"}
              onClick={() => navigate("/notifications")}
            >
              <IconBell />
            </ActionIcon>
          </Indicator>

          <ActionIcon
            color={location.pathname.startsWith("/discussion-editor") ? "green" : "dark"}
            onClick={() => navigate("/discussion-editor")}
          >
            <IconPencilPlus />
          </ActionIcon>

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
      <Flex direction="column" py="md" pr="md" gap="xs">
        <Card withBorder>
          <Flex direction="column" gap="md" align="center">

            <Anchor href="https://dorkodu.com" align="center">
              <img
                src={DorkoduLogo}
                alt="Dorkodu"
                draggable={false}
                style={{ width: "75%" }}
              />
            </Anchor>

            <Text color="dimmed" weight={450}>
              <b>Dorkodu</b> &copy; {new Date().getFullYear()}
            </Text>

          </Flex>
        </Card>
      </Flex>
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
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Button
      styles={{ label: { display: "flex", gap: theme.spacing.md, flexGrow: 1 } }}
      fullWidth
      variant="subtle"
      color={location.pathname === path ? "green" : "dark"}
      onClick={() => navigate(path)}
      {...props}
    >
      {icon}
      <Text truncate>{name}</Text>
    </Button>
  )
}

interface ButtonMobileProps extends React.ComponentPropsWithoutRef<"button"> {
  icon: React.ReactNode;
  path: string;
}

function ButtonMobile({ icon, path, style, ...props }: ButtonMobileProps) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ActionIcon
      size={32}
      color={location.pathname === path ? "green" : "dark"}
      onClick={() => navigate(path)}
      style={{ marginLeft: theme.spacing.md, width: "32px", height: "32px", ...style }}
      {...props}
    >
      {icon}
    </ActionIcon>
  )
}