import { css, Global } from "@emotion/react";
import { Loader, MantineProvider } from "@mantine/core";
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

  return (
    <>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <Suspense>
          {loading ? <Loader variant="dots" color="green" /> : <Outlet />}
        </Suspense>
      </MantineProvider>
      <Global styles={css`body { overflow-y: scroll; }`} />
    </>
  );
}

export default App;
