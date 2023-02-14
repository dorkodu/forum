import { css } from "@emotion/react";

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