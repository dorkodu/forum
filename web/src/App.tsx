import { css, Global } from "@emotion/react";
import { ActionIcon, AppShell, Card, Flex, Footer, Header, Loader, MantineProvider } from "@mantine/core";
import { IconArrowLeft, IconHome, IconMenu2, IconPencilPlus, IconSearch, IconUser } from "@tabler/icons";
import { Suspense, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./stores/authStore";
import { useUserStore } from "./stores/userStore";
import theme from "./styles/theme";
import ForumIcon from "./assets/forum_icon.svg";

function App() {
  const navigate = useNavigate();
  const queryAuth = useAuthStore((state) => state.queryAuth);
  const loading = useAppStore((state) => state.getLoading());

  const currentUserId = useAuthStore(state => state.userId);
  const currentUser = useUserStore(state => state.getUserById(currentUserId));

  const routeHome = () => navigate("/home");
  const routeSearch = () => navigate("/search");
  const routeProfile = () => currentUser && navigate(`/profile/${currentUser.username}`);
  const routeDiscussionEditor = () => navigate("/discussion-editor");
  const routeMenu = () => navigate("/menu");
  const goBack = () => navigate(-1);

  useEffect(() => { queryAuth() }, []);

  const AppHeader = () => (
    <Header px="md" pt="md" height={64} withBorder={false}>
      <Card css={css`height:100%;`} shadow="sm" radius="md" withBorder>
        <Flex css={css`height:100%;`} align="center" justify="space-between">
          <ActionIcon color="dark" onClick={goBack}><IconArrowLeft /></ActionIcon>
          <img src={ForumIcon} width={28} height={28} />
          <ActionIcon color="dark" onClick={routeMenu}><IconMenu2 /></ActionIcon>
        </Flex>
      </Card>
    </Header>
  )

  const AppFooter = () => (
    <Footer px="md" pb="md" height={64} withBorder={false}>
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
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <AppShell padding={0} header={<AppHeader />} footer={<AppFooter />}>
          <Suspense>
            {loading ? <Loader variant="dots" color="green" /> : <Outlet />}
          </Suspense>
        </AppShell>
      </MantineProvider>
      <Global styles={css`body { overflow-y: scroll; }`} />
    </>
  );
}

export default App;
