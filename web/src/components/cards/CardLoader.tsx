import { Card, Flex, Loader } from "@mantine/core";
import { useDelay } from "../hooks";

function CardLoader() {
  const delay = useDelay();
  if (delay) return null;

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" align="center">
        <Loader variant="dots" color="green" />
      </Flex>
    </Card>
  )
}

export default CardLoader