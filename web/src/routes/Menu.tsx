import { Button, Card, Divider, Flex, NativeSelect } from "@mantine/core"
import { IconLogin, IconLogout, IconWorld } from "@tabler/icons"
import { useTranslation } from "react-i18next";
import { ColorToggleSegmented } from "../components/ColorToggle";
import i18n from "../lib/i18n";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";


function Menu() {
  const { t } = useTranslation();
  const changeLocale = useAppStore(state => state.changeLocale);
  const queryLogout = useAuthStore(state => state.queryLogout);
  const currentUserId = useAuthStore(state => state.userId);

  const login = () => {
    document.location.href = "https://id.dorkodu.com/access?service=forum.dorkodu.com";
  }

  const logout = () => { queryLogout() }

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

        <ColorToggleSegmented />

        <Divider my={0} />

        {!currentUserId &&
          <Button
            radius="md"
            fullWidth
            variant="default"
            leftIcon={<IconLogin />}
            onClick={login}
          >
            {t("login")}
          </Button>
        }

        {currentUserId &&
          <Button
            radius="md"
            fullWidth
            variant="default"
            leftIcon={<IconLogout />}
            onClick={logout}
          >
            {t("logout")}
          </Button>
        }
      </Flex>
    </Card>
  )
}

export default Menu