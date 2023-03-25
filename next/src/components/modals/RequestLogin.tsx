import { Button, Flex, Modal, Title } from "@mantine/core";
import { useAppStore } from "../../stores/appStore";
import ForumIcon from "@/../public/forum.svg";
import { useTranslation } from "next-i18next";
import CustomLink from "../custom/CustomLink";
import Image from "next/image";

function RequestLogin() {
  const { t } = useTranslation();
  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const requestLogin = useAppStore(state => state.requestLogin);

  return (
    <Modal
      opened={requestLogin}
      onClose={() => setRequestLogin(false)}
      title={t("heyThere")}
      lockScroll={false}
      centered
    >
      <Flex direction="column" gap="md">
        <Flex justify="center">
          <Image src={ForumIcon.src} width={100} height={100} alt="Forum" />
        </Flex>

        <Title order={5} align="center">{t("pleaseLogin")}</Title>

        <CustomLink href="https://id.dorkodu.com/access?service=forum.dorkodu.com">
          <Flex direction="column">
            <Button radius="md">{t("login")}</Button>
          </Flex>
        </CustomLink>
      </Flex>
    </Modal>
  )
}

export default RequestLogin