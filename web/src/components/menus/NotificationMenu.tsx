import { ActionIcon, Menu } from "@mantine/core"
import { IconDots } from "@tabler/icons-react"

function NotificationMenu() {
  return (
    <Menu shadow="md" radius="md" position="bottom-end">
      <Menu.Target>
        <ActionIcon color="dark"><IconDots /></ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
      </Menu.Dropdown>
    </Menu>
  )
}

export default NotificationMenu