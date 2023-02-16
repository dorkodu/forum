import { Flex, Loader, Modal, Title } from "@mantine/core";
import ForumIcon from "@assets/forum.svg";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Piece } from "../TextParser";

interface Props {
  updateSW: (reloadPage?: boolean | undefined) => Promise<void>
}

function UpdateSW({ updateSW }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timeout = setTimeout(() => updateSW(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Modal
      opened={true}
      onClose={() => { }}
      lockScroll={false}
      withCloseButton={false}
      centered
    >
      <Flex direction="column" gap="md" align="center">
        <img src={ForumIcon} width={100} height={100} alt="Forum" />

        <Title order={5} align="center">
          {t("updating")}
          &nbsp;
          <Piece.Emoji emoji={"🌊"} />
        </Title>

        <Loader variant="dots" color="green" />
      </Flex>
    </Modal>
  )
}

export default UpdateSW