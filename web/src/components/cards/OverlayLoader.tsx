import { css } from "@emotion/react";
import { LoadingOverlay } from "@mantine/core";
import { useDelay } from "../hooks";

interface Props {
  full?: boolean;
}

function OverlayLoader({ full }: Props) {
  const delay = useDelay();
  if (delay) return null;

  return (
    <LoadingOverlay
      visible={true}
      overlayBlur={2}
      css={full ? css`position: fixed;` : null}
    />
  )
}

export default OverlayLoader