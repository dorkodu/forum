import { Button, Flex, Modal, Title } from "@mantine/core";
import { useAppStore } from "../stores/appStore";
import ForumIcon from "@assets/forum.svg";
import { Trans, useTranslation } from "react-i18next";

function RequestLogin() {
  const { t } = useTranslation();
  const requestedLogin = useAppStore(state => state.requestedLogin);
  const requestLogin = useAppStore(state => state.requestLogin);

  const login = () => {
    document.location.href = "https://id.dorkodu.com/access?service=forum.dorkodu.com";
  }

  return (
    <Modal
      opened={requestedLogin}
      onClose={() => requestLogin(false)}
      title={t("heyThere")}
      lockScroll={false}
      centered
    >
      <Flex direction="column" gap="md">
        <img src={ForumIcon} width={100} height={100} />
        <Title order={5}><Trans t={t} i18nKey="pleaseLogin" /></Title>
        <Flex direction="column">
          <Button radius="md" onClick={login}>{t("login")}</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default RequestLogin