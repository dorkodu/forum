import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Box,
  Button,
  Card,
  createStyles,
  Divider,
  Flex,
  Footer,
  Group,
  Header,
  Image,
  Indicator,
  MediaQuery,
  ScrollArea,
  Text,
  useMantineTheme,
} from "@mantine/core";

import {
  IconArrowLeft,
  IconBell,
  IconEdit,
  IconHome,
  IconMenu2,
  IconPencilPlus,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";

import RequestLogin from "../modals/RequestLogin";
import { Outlet, useNavigate } from "react-router-dom";
import ForumBrandLight from "@/assets/forum_brand-light.svg";
import ForumBrandDark from "@/assets/forum_brand-dark.svg";
import DorkoduLogo from "@/assets/dorkodu_logo.svg";
import { clickable } from "@/styles/css";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { AppStoreState, useAppStore } from "@/stores/appStore";

const useStyles = createStyles((theme) => ({
  Header: {
    maxWidth: 600,
    margin: "0 auto",
  },

  Footer: {
    display: "none",
    maxWidth: theme.breakpoints.lg,
    margin: "0 auto",

    [theme.fn.smallerThan(640)]: {
      display: "block",
    },
  },

  Navbar: {
    width: 300,
    flexShrink: 0,
    position: "relative",

    [theme.fn.smallerThan(1024)]: {
      width: 64,
    },

    [theme.fn.smallerThan(640)]: {
      display: "none",
    },
  },

  Aside: {
    width: 300,
    flexShrink: 0,
    position: "relative",

    [theme.fn.smallerThan(840)]: {
      width: 200,
    },

    [theme.fn.smallerThan(768)]: {
      display: "none",
    },
  },
}));

export default function DefaultLayout() {
  const matches = useMediaQuery("(max-width: 640px)");

  return (
    <>
      <AppShell
        header={<DefaultHeader />}
        footer={<DefaultFooter />}
        padding={0}>
        <Flex direction="row" style={{ height: "100%" }}>
          <DefaultNavbar />
          {/* Remove padding-bottom created by mantine footer on the desktop layout */}
          <Flex
            direction="column"
            style={{ flexGrow: 1, marginBottom: matches ? 0 : "-64px" }}>
            <Outlet />
          </Flex>
          <DefaultAside />
        </Flex>
      </AppShell>

      <RequestLogin />
    </>
  );
}

function DefaultHeader() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const route = useAppStore((state) => state.route);

  const isSmallScreen = useMediaQuery("(max-width: 500px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const Spotlight = (
    <Card sx={{ height: "100%" }} shadow="sm" radius="md" withBorder>
      <Flex sx={{ height: "100%" }} align="center" justify="space-between">
        <ActionIcon
          color="dark"
          onClick={() => navigate(-1)}
          sx={route === "home" ? { visibility: "hidden" } : undefined}>
          <IconArrowLeft />
        </ActionIcon>

        {isSmallScreen && (
          <img
            src={
              theme.colorScheme === "dark" ? ForumBrandLight : ForumBrandDark
            }
            alt="Forum"
            height={32}
            draggable={false}
            style={clickable}
            onClick={() => navigate("/home")}
          />
        )}

        <ActionIcon
          color={route === "menu" ? "green" : "dark"}
          onClick={() => navigate("/menu")}>
          <IconMenu2 />
        </ActionIcon>
      </Flex>
    </Card>
  );

  return (
    <Header
      className={classes.Header}
      px="md"
      pt="md"
      height={64}
      withBorder={false}>
      {Spotlight}
    </Header>
  );
}

function DefaultFooter() {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const route = useAppStore((state) => state.route);

  const authorized = useAuthStore((state) => state.userId);
  const currentUserId = useAuthStore((state) => state.userId);
  const currentUser = useUserStore((state) => state.getUserById(currentUserId));

  return (
    <Footer
      className={classes.Footer}
      px="md"
      pb="md"
      height={64}
      withBorder={false}>
      <Card sx={{ height: "100%" }} shadow="sm" p="md" radius="md" withBorder>
        <Group
          sx={{ height: "100%" }}
          align="center"
          position="center"
          spacing="lg"
          noWrap>
          <ActionIcon
            color={route === "home" ? "green" : "dark"}
            onClick={() => navigate("/home")}>
            <IconHome />
          </ActionIcon>

          <ActionIcon
            color={route === "search" ? "green" : "dark"}
            onClick={() => navigate("/search")}>
            <IconSearch />
          </ActionIcon>

          {authorized && (
            <>
              <ActionIcon
                color={route === "profile" ? "green" : "dark"}
                onClick={() => navigate(`/profile/${currentUser?.username}`)}>
                <IconUser />
              </ActionIcon>

              {/*
               * Set indicator z-index to 101 (1 higher than appshell's footer).
               * Causes rendering order bug in SM-M236B Android 12 (and other?).
               */}
              <Indicator
                color="red"
                disabled={!currentUser?.hasNotification}
                zIndex={101}
                size={8}>
                <ActionIcon
                  color={route === "notifications" ? "green" : "dark"}
                  onClick={() => navigate("/notifications")}>
                  <IconBell />
                </ActionIcon>
              </Indicator>

              <ActionIcon
                color={route === "discussion-editor" ? "green" : "dark"}
                onClick={() => navigate("/discussion-editor")}>
                <IconPencilPlus />
              </ActionIcon>
            </>
          )}
        </Group>
      </Card>
    </Footer>
  );
}

function DefaultNavbar() {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const authorized = useAuthStore((state) => state.userId);
  const currentUserId = useAuthStore((state) => state.userId);
  const currentUser = useUserStore((state) => state.getUserById(currentUserId));

  const isWideScreen = useMediaQuery("(min-width: 1081px)");

  const Links = (
    <Flex direction="column" gap="xs">
      <ButtonNavbar
        icon={<IconHome />}
        name={t("routes.home")}
        path={"/home"}
        pathName="home"
      />
      <ButtonNavbar
        icon={<IconSearch />}
        name={t("routes.search")}
        path={"/search"}
        pathName="search"
      />
      {authorized && (
        <>
          <ButtonNavbar
            icon={<IconUser />}
            name={t("routes.profile")}
            path={`/profile/${currentUser?.username}`}
            pathName="profile"
          />
          <ButtonNavbar
            icon={<IconBell />}
            name={t("routes.notifications")}
            path={"/notifications"}
            pathName="notifications"
            data={{ notification: currentUser?.hasNotification }}
          />

          <ButtonNavbar
            icon={<IconEdit />}
            name={t("routes.discussionEditor")}
            path={"/discussion-editor"}
            pathName="discussion-editor"
          />
        </>
      )}
    </Flex>
  );

  return (
    <Flex direction="column" w={300} className={classes.Navbar}>
      <div style={{ position: "fixed", width: "inherit" }}>
        <Flex direction="column" py="md" pl="md">
          {/* TODO: Magic number alert! 96px = header (64px) + padding y (16px * 2) */}
          <ScrollArea sx={{ height: "calc(100vh - 96px)" }}>{Links}</ScrollArea>
        </Flex>
      </div>
    </Flex>
  );
}

function DefaultAside() {
  const { classes: $ } = useStyles();

  const links: { label: string; link: string }[] = [
    { label: "About", link: "/about" },
    { label: "Terms", link: "https://dorkodu.com/terms" },
    { label: "Privacy", link: "https://dorkodu.com/privacy" },
  ];

  return (
    <Flex direction="column" w={300} className={$.Aside}>
      <div style={{ position: "fixed", width: "inherit" }}>
        <Flex direction="column" py="md" pr="md">
          {/* TODO: Magic number alert! 96px = header (64px) + padding y (16px * 2) */}
          <ScrollArea sx={{ height: "calc(100vh - 96px)" }}>
            <Flex direction="column" gap="xs">
              <Box>
                <Flex direction="column" gap="md" align="center">
                  <Anchor href="https://dorkodu.com" align="center">
                    <img
                      src={DorkoduLogo}
                      alt="Dorkodu"
                      draggable={false}
                      style={{ width: "75%", maxWidth: 200 }}
                    />
                  </Anchor>
                  <Group mb={0}>
                    {links.map((link) => (
                      <Anchor<"a">
                        color="dimmed"
                        key={link.label}
                        href={link.link}
                        onClick={(event) => event.preventDefault()}
                        size="sm">
                        {link.label}
                      </Anchor>
                    ))}
                  </Group>

                  <Text color="dimmed" weight={450} mt={0}>
                    <b>Dorkodu</b> &copy; {new Date().getFullYear()}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </ScrollArea>
        </Flex>
      </div>
    </Flex>
  );
}

interface ButtonProps {
  icon: React.ReactNode;
  name: string;
  path: string;
  pathName: AppStoreState["route"];
  data?: { notification?: boolean };
  cta?: boolean;
}

function ButtonNavbar({
  icon,
  name,
  path,
  pathName,
  data,
  cta = false,
}: ButtonProps) {
  return (
    <>
      <MediaQuery query="(max-width: 1024px)" styles={{ display: "none" }}>
        <ButtonDesktop
          icon={icon}
          name={name}
          path={path}
          pathName={pathName}
          data={data}
        />
      </MediaQuery>

      <MediaQuery
        query="(max-width: 1024px)"
        styles={{ display: "block !important" }}>
        <ButtonMobile
          icon={icon}
          path={path}
          pathName={pathName}
          data={data}
          style={{ display: "none" }}
        />
      </MediaQuery>
    </>
  );
}

interface ButtonDesktopProps extends React.ComponentPropsWithoutRef<"button"> {
  icon: React.ReactNode;
  name: string;
  path: string;
  pathName: AppStoreState["route"];
  data?: { notification?: boolean };
}

function ButtonDesktop({
  icon,
  name,
  path,
  pathName,
  data,
  ...props
}: ButtonDesktopProps) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const route = useAppStore((state) => state.route);

  return (
    <Button
      styles={{
        label: { display: "flex", gap: theme.spacing.md, flexGrow: 1 },
      }}
      sx={{
        maxWidth: 200,
      }}
      variant="subtle"
      color={route === pathName ? "green" : "dark"}
      onClick={() => navigate(path)}
      {...props}>
      <Indicator
        color="red"
        disabled={!data?.notification}
        zIndex={101}
        size={8}>
        {icon}
      </Indicator>
      <Text truncate>{name}</Text>
    </Button>
  );
}

interface ButtonMobileProps extends React.ComponentPropsWithoutRef<"button"> {
  icon: React.ReactNode;
  path: string;
  pathName: AppStoreState["route"];
  data?: { notification?: boolean };
}

function ButtonMobile({
  icon,
  path,
  pathName,
  data,
  style,
  ...props
}: ButtonMobileProps) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const route = useAppStore((state) => state.route);

  return (
    <ActionIcon
      size={24}
      color={route === pathName ? "green" : "dark"}
      onClick={() => navigate(path)}
      style={{
        marginLeft: theme.spacing.md,
        width: "32px",
        height: "32px",
        ...style,
      }}
      {...props}>
      <Flex direction="column" align="center" justify="center">
        {/* Set indicator size to 8px to fix horizontal scrollbar appearing at the bottom */}
        <Indicator
          color="red"
          disabled={!data?.notification}
          zIndex={101}
          size={8}>
          {icon}
        </Indicator>
      </Flex>
    </ActionIcon>
  );
}
