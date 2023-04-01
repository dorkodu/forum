import LanguagePicker from "@/components/LanguagePicker";
import { Button, Card, Divider, Flex } from "@mantine/core"
import { IconLogin, IconLogout } from "@tabler/icons-react"
import { useTranslation } from "react-i18next";
import { ColorToggleSegmented } from "../components/ColorToggle";
import { useAuthStore } from "../stores/authStore";

function Menu() {
  const { t } = useTranslation();
  const queryLogout = useAuthStore(state => state.queryLogout);
  const currentUserId = useAuthStore(state => state.userId);

  const login = () => {
    document.location.href = "https://id.dorkodu.com/access?service=forum.dorkodu.com";
  }

  const logout = () => { queryLogout() }

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        <LanguagePicker />

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