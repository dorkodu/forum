import LanguagePicker from "@/components/LanguagePicker";
import { Button, Card, Divider, Flex } from "@mantine/core"
import { IconLogin, IconLogout } from "@tabler/icons-react"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { ColorToggleSegmented } from "../components/ColorToggle";
import { useAuthStore } from "../stores/authStore";

export default function Menu() {
  const { t } = useTranslation();
  const queryLogout = useAuthStore(state => state.queryLogout);
  const currentUserId = useAuthStore(state => state.userId);

  const login = () => {
    document.location.href = "https://id.dorkodu.com/access?service=forum.dorkodu.com";
  }

  const logout = () => { queryLogout() }

  return (
    <>
      <Head>
        <title>Forum</title>
        <meta name="title" content="Forum" />
        <meta name="description" content="Social Discourse @ Dorkodu" />
      </Head>
      <main>
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
      </main>
    </>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}