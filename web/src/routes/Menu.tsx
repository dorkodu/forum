import { Button, Card, Divider, Flex, NativeSelect } from "@mantine/core"
import { IconLogin, IconLogout, IconWorld } from "@tabler/icons"
import i18n from "../lib/i18n";
import { useAppStore } from "../stores/appStore";


function Menu() {
  const changeLocale = useAppStore(state => state.changeLocale);

  const login = () => {
    document.location.href = "https://id.dorkodu.com/access?service=cherno.dorkodu.com";
  }

  const logout = () => {

  }

  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        <NativeSelect
          radius="md"
          variant="default"
          placeholder="language..."
          icon={<IconWorld />}
          value={i18n.language}
          onChange={(ev) => changeLocale(ev.currentTarget.value)}
          data={[
            { value: 'en', label: 'English' },
            { value: 'tr', label: 'Türkçe' },
          ]}
        />

        <Divider my={0} />

        <Button
          radius="md"
          fullWidth
          variant="default"
          leftIcon={<IconLogin />}
          onClick={login}
        >
          log in
        </Button>

        <Button
          radius="md"
          fullWidth
          variant="default"
          leftIcon={<IconLogout />}
          onClick={logout}
        >
          log out
        </Button>
      </Flex>
    </Card>
  )
}

export default Menu