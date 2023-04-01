import { MantineTheme, MantineThemeOverride } from "@mantine/core";

const theme: MantineThemeOverride = {
  focusRing: "auto",
  respectReducedMotion: true,
  cursorType: "pointer",
  defaultRadius: "md",
  dir: "ltr",

  primaryColor: "green",

  defaultGradient: { deg: 60, from: "green", to: "lime" },

  fontFamily: `Rubik, Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, sans-serif`,

  fontFamilyMonospace: `ui-monospace, "JetBrains Mono", "Cascadia Mono", SFMono-Regular, "Segoe UI Mono", "Roboto Mono", Liberation Mono, Courier New, "Ubuntu Mono",  Menlo, Monaco, Consolas, monospace`,

  lineHeight: 1.25,

  headings: {
    fontWeight: 600,
    fontFamily: "Rubik",

    sizes: {
      h1: { lineHeight: 1.25, fontWeight: 800 },
      h2: { lineHeight: 1.25, fontWeight: 750 },
      h3: { lineHeight: 1.3, fontWeight: 650 },
      h4: { lineHeight: 1.3, fontWeight: 600 },
      h5: { lineHeight: 1.35, fontWeight: 550 },
      h6: { lineHeight: 1.35, fontWeight: 500 },
    },
  },

  globalStyles: (theme: MantineTheme) => ({}),
};

export default theme;
