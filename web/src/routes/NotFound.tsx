import { Card, Text } from "@mantine/core"

function NotFound() {
  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Text align="center">{"not found :("}</Text>
    </Card>
  )
}

export default NotFound