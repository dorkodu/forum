import { Card, Flex, Loader } from "@mantine/core"

function CardLoader() {
  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex direction="column" align="center">
        <Loader variant="dots" color="green" />
      </Flex>
    </Card>
  )
}

export default CardLoader