import { css, Global } from "@emotion/react";
import { ActionIcon, AppShell, Card, ColorScheme, ColorSchemeProvider, Flex, Footer, Header, Indicator, MantineProvider } from "@mantine/core";
import { IconArrowLeft, IconBell, IconHome, IconMenu2, IconPencilPlus, IconSearch, IconUser } from "@tabler/icons";
import { Suspense, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./stores/authStore";
import { useUserStore } from "./stores/userStore";
import theme from "./styles/theme";
import ForumIcon from "./assets/forum.svg";
import { useLocalStorage } from "@mantine/hooks";
import RequestLogin from "./components/modals/RequestLogin";
import CenterLoader from "./components/cards/CenterLoader";
import OverlayLoader from "./components/cards/OverlayLoader";
import { useRegisterSW } from 'virtual:pwa-register/react';
import UpdateSW from "./components/modals/UpdateSW";
import { ScrollRestoration } from "react-router-dom"

const width = css`
  max-width: 768px;
  margin: 0 auto;
`;

const global = css`
  body {
    ${width}
    overflow-y: scroll;
    overscroll-behavior: contain;
    
    font-family: Rubik, sans-serif;
  }

  @font-face {
    font-family: sans-serif;
    src: local("sans-serif");
    letter-spacing: 0.6px;
    word-spacing: -1.65px;
  }
`;

function App() {
  const navigate = useNavigate();

  // Loading auth and locale are different,
  // on locale, it's fine to keep current view since it doesn't effect functionality
  // on auth, it effects functionality so hide the view
  const loading = useAppStore((state) => state.loading);
  const setRequestLogin = useAppStore(state => state.setRequestLogin);

  const queryAuth = useAuthStore((state) => state.queryAuth);
  const currentUserId = useAuthStore(state => state.userId);
  const currentUser = useUserStore(state => state.getUserById(currentUserId));

  const routeHome = () => navigate("/home");
  const routeSearch = () => navigate("/search");
  const routeProfile = () => {
    if (!currentUser) setRequestLogin(true);
    else navigate(`/profile/${currentUser.username}`)
  }
  const routeNotifications = () => {
    if (!currentUser) setRequestLogin(true);
    else navigate("/notifications")
  }
  const routeDiscussionEditor = () => {
    if (!currentUser) setRequestLogin(true);
    else navigate("/discussion-editor")
  }
  const routeMenu = () => navigate("/menu");
  const goBack = () => navigate(-1);

  const {
    offlineReady: [_offlineReady, _setOfflineReady],
    needRefresh: [needRefresh, _setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "theme",
    defaultValue: "light",
    getInitialValueInEffect: false,
    serialize: (value) => value,
    deserialize: (value) => value as ColorScheme,
  });

  const toggleColorScheme = (value?: ColorScheme) => {
    const scheme = value || (colorScheme === "dark" ? "light" : "dark");
    const color = scheme === "light" ? "#ffffff" : "#1A1B1E";
    document.documentElement.style.backgroundColor = color;
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColor) themeColor.content = color;
    setColorScheme(scheme);
  }

  useEffect(() => { queryAuth() }, []);

  const AppHeader = () => (
    <Header css={width} px="md" pt="md" height={64} withBorder={false}>
      <Card css={css`height:100%;`} shadow="sm" radius="md" withBorder>
        <Flex css={css`height:100%;`} align="center" justify="space-between">
          <ActionIcon
            color="dark"
            onClick={goBack}
            css={location.pathname !== "/home" ? css`` : css`visibility: hidden;`}>
            <IconArrowLeft />
          </ActionIcon>

          <img src={ForumIcon} width={28} height={28} alt="Forum" />

          <ActionIcon
            color="dark"
            onClick={routeMenu}>
            <IconMenu2 />
          </ActionIcon>
        </Flex>
      </Card>
    </Header>
  )

  const AppFooter = () => (
    <Footer css={width} px="md" pb="md" height={64} withBorder={false}>
      <Card css={css`height:100%;`} shadow="sm" p="lg" radius="md" withBorder>
        <Flex css={css`height:100%;`} align="center" justify="space-evenly">
          <ActionIcon color="dark" onClick={routeHome}><IconHome /></ActionIcon>
          <ActionIcon color="dark" onClick={routeSearch}><IconSearch /></ActionIcon>
          <ActionIcon color="dark" onClick={routeProfile}><IconUser /></ActionIcon>

          {/* 
            Set indicator z-index to 101 (1 higher than appshell's footer).
            Causes rendering order bug in SM-M236B Android 12 (and other?).
          */}
          <Indicator color="red" disabled={!currentUser?.hasNotification} zIndex={101}>
            <ActionIcon color="dark" onClick={routeNotifications}><IconBell /></ActionIcon>
          </Indicator>

          <ActionIcon color="dark" onClick={routeDiscussionEditor}><IconPencilPlus /></ActionIcon>
        </Flex>
      </Card>
    </Footer>
  )

  return (
    <>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ ...theme, colorScheme }} withGlobalStyles withNormalizeCSS>
          <AppShell padding={0} header={<AppHeader />} footer={<AppFooter />}>
            <Suspense fallback={<CenterLoader />}>
              {(loading.auth || loading.locale) && <OverlayLoader full={true} />}
              <Outlet />
              <RequestLogin />
              {needRefresh && <UpdateSW updateSW={updateServiceWorker} />}
            </Suspense>
          </AppShell>
        </MantineProvider>
      </ColorSchemeProvider>

      <Global styles={global} />
      <ScrollRestoration />
    </>
  );
}

export default App;
