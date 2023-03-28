import { Loader } from "@mantine/core";
import { useDelay } from "../hooks";

function DefaultLoader() {
  const delay = useDelay();
  if (delay) return null;

  return <Loader variant="dots" color="green" />
}

export default DefaultLoader