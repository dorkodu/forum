import { css, Global } from "@emotion/react";
import { ActionIcon, AppShell, Card, ColorScheme, ColorSchemeProvider, Flex, Footer, Header, LoadingOverlay, MantineProvider } from "@mantine/core";
import { IconArrowLeft, IconHome, IconMenu2, IconPencilPlus, IconSearch, IconUser } from "@tabler/icons";
import { Suspense, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./stores/authStore";
import { useUserStore } from "./stores/userStore";
import theme from "./styles/theme";
import ForumIcon from "./assets/forum.svg";
import { useLocalStorage } from "@mantine/hooks";
import RequestLogin from "./components/RequestLogin";

const width = css`
  max-width: 768px;
  margin: 0 auto;
`;

const global = css`
  body {
    ${width}
    overflow-y: scroll;
  }
`;

function App() {
  const navigate = useNavigate();

  // Loading auth and locale are different,
  // on locale, it's fine to keep current view since it doesn't effect functionality
  // on auth, it effects functionality so hide the view
  const loading = useAppStore((state) => state.loading);
  const requestLogin = useAppStore(state => state.requestLogin);

  const queryAuth = useAuthStore((state) => state.queryAuth);
  const currentUserId = useAuthStore(state => state.userId);
  const currentUser = useUserStore(state => state.getUserById(currentUserId));

  const routeHome = () => navigate("/home");
  const routeSearch = () => navigate("/search");
  const routeProfile = () => {
    if (!currentUser) requestLogin(true);
    else navigate(`/profile/${currentUser.username}`)
  }
  const routeDiscussionEditor = () => {
    if (!currentUser) requestLogin(true);
    else navigate("/discussion-editor")
  }
  const routeMenu = () => navigate("/menu");
  const goBack = () => navigate(-1);

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'theme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

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

          <img src={ForumIcon} width={28} height={28} />

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
            <Suspense>
              <LoadingOverlay
                visible={loading.auth || loading.locale}
                overlayBlur={2}
                css={css`position: fixed;`}
              />
              {!loading.auth && <Outlet />}
              <RequestLogin />
            </Suspense>
          </AppShell>
        </MantineProvider>
      </ColorSchemeProvider>
      <Global styles={global} />
    </>
  );
}

export default App;
