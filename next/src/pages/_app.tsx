import type { AppContext, AppInitialProps, AppProps } from 'next/app'
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core"
import { theme } from '@/styles/theme';
import { emotionCache } from '@/styles/cache';
import Head from 'next/head';
import { useState } from 'react';
import App from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import Script from 'next/script';
import { appWithTranslation } from 'next-i18next';
import { NextApiRequest, NextApiResponse } from 'next';
import type auth from '@/lib/api/controllers/auth';
import { UserProvider } from '@/stores/userContext';

type CustomAppProps = { authorized?: boolean, theme?: ColorScheme }

export function CustomApp(props: AppProps & CustomAppProps) {
  const { Component, pageProps } = props;

  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.theme || "light");
  const toggleColorScheme = (value?: ColorScheme) => {
    const scheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    const color = scheme === "light" ? "#fff" : "#1A1B1E";
    document.documentElement.style.backgroundColor = color;

    setColorScheme(scheme);
    setCookie('theme', scheme, { maxAge: 60 * 60 * 24 * 365 });
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider emotionCache={emotionCache} theme={{ ...theme, colorScheme }} withGlobalStyles withNormalizeCSS>

        <UserProvider authorized={props.authorized}>

          <Head>
            <meta
              name='viewport'
              content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover'
            />

            <link rel="icon" type="image/svg+xml" href="/id.svg" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00cc30" />
            <meta name="msapplication-TileColor" content="#ffffff" />
            <meta name="theme-color" content={colorScheme === "light" ? "#fff" : "#1A1B1E"} />
          </Head>

          <Script id="theme" strategy="beforeInteractive">
            {'let a=`; ${document.cookie}`.split("; theme="),b=2===a.length&&a.pop().split(";").shift(),c="dark"===b?"#1A1B1E":"#fff";document.documentElement.style.backgroundColor=c'}
          </Script>

          <Component {...pageProps} />

        </UserProvider>

      </MantineProvider>
    </ColorSchemeProvider>
  )
}

CustomApp.getInitialProps = async (context: AppContext): Promise<CustomAppProps & AppInitialProps> => {
  const ctx = await App.getInitialProps(context);
  const req = context.ctx.req as NextApiRequest;
  const res = context.ctx.res as NextApiResponse;

  let authorized: boolean | undefined = undefined;
  let theme: ColorScheme | undefined = undefined;

  if (typeof window === "undefined") {
    // Called only once when the user first enters the website
    if (!context.ctx.req?.url?.startsWith("/_next/data")) {
      // Get user's theme
      theme = getCookie("theme", context.ctx) as ColorScheme | undefined;
      if (theme !== "light" && theme !== "dark") theme = "light";

      // Get user's authorization status
      const _auth = (await require('@/lib/api/controllers/auth')).default as typeof auth;
      const result = await _auth.auth.executor({}, { req, res });
      const status = !(!result?.data || result.error);
      authorized = status;
    }
  }

  return {
    ...ctx,
    authorized,
    theme,
  }
}

export default appWithTranslation(CustomApp)