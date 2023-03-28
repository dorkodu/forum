import { CSSObject, Loader } from "@mantine/core";
import { useDelay } from "../hooks";

const center = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
} satisfies CSSObject

function CenterLoader() {
  const delay = useDelay();
  if (delay) return null;

  return <Loader variant="dots" color="green" sx={center} />
}

export default CenterLoader