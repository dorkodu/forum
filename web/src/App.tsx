import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "./stores/appStore";
import { useAuthStore } from "./stores/authStore";
import { useLocalStorage } from "@mantine/hooks";
import RequestLogin from "./components/modals/RequestLogin";
import { useRegisterSW } from 'virtual:pwa-register/react';
import UpdateSW from "./components/modals/UpdateSW";
import { ScrollRestoration } from "react-router-dom"
import { theme } from "./styles/theme";
import CenterLoader from "./components/loaders/CenterLoader";
import OverlayLoader from "./components/loaders/OverlayLoader";
import DefaultLayout from "./components/layouts/DefaultLayout";

function App() {
  const location = useLocation();

  // Loading auth and locale are different,
  // on locale, it's fine to keep current view since it doesn't effect functionality
  // on auth, it effects functionality so hide the view
  const loading = useAppStore((state) => state.loading);
  const queryAuth = useAuthStore((state) => state.queryAuth);

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

  // Check the current route on change & set useAppStore.route accordingly
  useEffect(() => {
    if (location.pathname.indexOf("/home") !== -1) useAppStore.setState(s => { s.route = "home" });
    else if (location.pathname.indexOf("/search") !== -1) useAppStore.setState(s => { s.route = "search" });
    else if (location.pathname.indexOf("/profile") !== -1) useAppStore.setState(s => { s.route = "profile" });
    else if (location.pathname.indexOf("/notifications") !== -1) useAppStore.setState(s => { s.route = "notifications" });
    else if (location.pathname.indexOf("/discussion-editor") !== -1) useAppStore.setState(s => { s.route = "discussion-editor" });
    else if (location.pathname.indexOf("/menu") !== -1) useAppStore.setState(s => { s.route = "menu" });
    else useAppStore.setState(s => { s.route = "any" });
  }, [location.pathname]);

  useEffect(() => { queryAuth() }, []);

  return (
    <>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ ...theme, colorScheme }} withGlobalStyles withNormalizeCSS>
          <DefaultLayout>
            <Suspense fallback={<CenterLoader />}>
              {(loading.auth || loading.locale) && <OverlayLoader full={true} />}
              {!loading.auth && <Outlet />}
              {needRefresh && <UpdateSW updateSW={updateServiceWorker} />}
              <RequestLogin />
            </Suspense>
          </DefaultLayout>
        </MantineProvider>
      </ColorSchemeProvider>

      <ScrollRestoration />
    </>
  );
}

export default App;
