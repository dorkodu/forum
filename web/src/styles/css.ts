import { css } from "@emotion/react";
import { MantineTheme } from "@mantine/core";

export const nowrap = css`white-space: nowrap;`
export const wrapContent = css`white-space: pre-wrap; word-break: break-word;`
export const autoGrid = css`
  display: grid;
  grid-template-columns: auto auto auto;
`
export const emoji = css`
  height: 1em;
  width: 1em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
`

export const colorBW = (theme: MantineTheme) => css`
  color: ${theme.colorScheme === "light" ? theme.colors.dark[8] : theme.colors.dark[0]};
`
export const bgColorHover = (theme: MantineTheme) => css`
  cursor: pointer;
  background-color: ${theme.colorScheme === "light" ? theme.white : theme.colors.dark[6]};
  
  &:hover {
    background-color: ${theme.colorScheme === "light" ? theme.colors.gray[0] : theme.colors.dark[5]};
  }
`