import { Card, Text } from "@mantine/core"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export default function Page404() {
  const { t } = useTranslation();

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Text align="center">{t("notFound")}</Text>
    </Card>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}