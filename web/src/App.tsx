import { Loader, MantineProvider } from "@mantine/core";
import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "./stores/appStore";
import { useUserStore } from "./stores/userStore";
import theme from "./styles/theme";

function App() {
  const loading = useAppStore((state) => state.getLoading());
  const queryAuth = useUserStore((state) => state.queryAuth);
  useEffect(() => {
    queryAuth();
  }, []);

  return (
    <>
      <MantineProvider theme={theme}>
        <Suspense>
          {loading ? <Loader variant="dots" color="green" /> : <Outlet />}
        </Suspense>
      </MantineProvider>
    </>
  );
}

export default App;
