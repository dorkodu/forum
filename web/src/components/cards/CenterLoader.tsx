import { css } from "@emotion/react";
import { Loader } from "@mantine/core";
import { useDelay } from "../hooks";

const center = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

function CenterLoader() {
  const delay = useDelay();
  if (delay) return null;

  return <Loader variant="dots" color="green" css={center} />
}

export default CenterLoader