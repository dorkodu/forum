import { Card, Text } from "@mantine/core"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import Head from "next/head";

export default function Page500() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>Forum</title>
        <meta name="title" content="Forum" />
        <meta name="description" content="Social Discourse @ Dorkodu" />
      </Head>
      <main>
        <DefaultLayout>
          <Card shadow="sm" p="md" m="md" radius="md" withBorder>
            <Text align="center">{t("notFound")}</Text>
          </Card>
        </DefaultLayout>
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