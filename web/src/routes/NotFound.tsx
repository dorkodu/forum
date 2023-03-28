import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Card, Text } from "@mantine/core"
import { useTranslation } from "react-i18next";

function NotFound() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <Card shadow="sm" p="md" m="md" radius="md" withBorder>
        <Text align="center">{t("notFound")}</Text>
      </Card>
    </DefaultLayout>
  )
}

export default NotFound