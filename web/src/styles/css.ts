import { CSSObject, MantineTheme } from "@mantine/core";

export const clickable = { cursor: "pointer" } satisfies CSSObject

export const nowrap = { whiteSpace: "nowrap" } satisfies CSSObject
export const wrapContent = { whiteSpace: "pre-wrap", wordBreak: "break-word" } satisfies CSSObject

export const flexGrow = { flexGrow: 1 } satisfies CSSObject
export const autoGrid = { display: "grid", gridTemplateColumns: "auto auto auto" } satisfies CSSObject

export const color = (theme: MantineTheme, color: MantineTheme["colors"][string]) => theme.colorScheme === "light" ? color[6] : color[2];

export const colorBW = (theme: MantineTheme) => ({
  color: `${theme.colorScheme === "light" ? theme.colors.dark[8] : theme.colors.dark[0]}`
}) satisfies CSSObject

export const bgColorHover = (theme: MantineTheme) => ({
  cursor: "pointer",
  backgroundColor: `${theme.colorScheme === "light" ? theme.white : theme.colors.dark[6]}`,
  "&:hover": {
    backgroundColor: `${theme.colorScheme === "light" ? theme.colors.gray[0] : theme.colors.dark[5]}`
  }
}) satisfies CSSObject

export const emoji = {
  height: "1em",
  width: "1em",
  margin: "0 .05em 0 .1em",
  verticalAlign: "-0.1em"
} satisfies CSSObject