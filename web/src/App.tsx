import { css, Global } from "@emotion/react";
import { AppShell, Card, Flex, Footer, Header, Loader, MantineProvider } from "@mantine/core";
import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./stores/authStore";
import theme from "./styles/theme";

function App() {
  const loading = useAppStore((state) => state.getLoading());
  const queryAuth = useAuthStore((state) => state.queryAuth);
  useEffect(() => {
    queryAuth();
  }, []);

  const AppHeader = () => (
    <Header px="md" pt="md" height={64} withBorder={false}>
      <Card css={css`height:100%;`} shadow="sm" p="lg" radius="md" withBorder>
        <Flex css={css`height:100%;`} align="center">
          hello, world
        </Flex>
      </Card>
    </Header>
  )

  const AppFooter = () => (
    <Footer px="md" pb="md" height={64} withBorder={false}>
      <Card css={css`height:100%;`} shadow="sm" p="lg" radius="md" withBorder>
        <Flex css={css`height:100%;`} align="center">
          hello, worldawdwa
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
