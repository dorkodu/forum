import { MantineTheme, MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  globalStyles: (theme: MantineTheme) => ({
    body: {
      overflowY: "scroll",
      overscrollBehavior: "contain",

      maxWidth: theme.breakpoints.lg,
      margin: "0 auto",
    },

    "@font-face": {
      fontFamily: "sans-serif",
      src: 'local("sans-serif")',
      letterSpacing: "0.6px",
      wordSpacing: "-1.65px",
    }
  }),

  dir: "ltr",
  respectReducedMotion: true,

  primaryColor: "green",
  defaultRadius: "md",
  cursorType: "pointer",
  focusRing: "auto",
  loader: "dots",

  fontFamily: `Rubik, Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, sans-serif`,
  fontFamilyMonospace: `ui-monospace, "JetBrains Mono", "Cascadia Mono", SFMono-Regular, "Segoe UI Mono", "Roboto Mono", Liberation Mono, Courier New, "Ubuntu Mono",  Menlo, Monaco, Consolas, monospace`,
}