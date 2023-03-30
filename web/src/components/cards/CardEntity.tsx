import { IUser } from "@api/types/user";
import { Anchor, Avatar, Card, Flex, Text, useMantineTheme } from "@mantine/core"
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { autoGrid, bgColorHover, colorBW, flexGrow, wrapContent } from "../../styles/css"
import TextParser, { PieceType } from "../TextParser";
import CustomTooltip from "../custom/CustomTooltip";
import { util } from "@/lib/util";

interface Props {
  user: IUser;
  entity: {
    date?: number,
    updateDate?: number,
    content: string,
  };

  onClickCard?: (ev: MouseEvent) => void;
  onClickUser: (ev: MouseEvent) => void;

  componentMenu: React.ReactNode;
  componentBottom?: React.ReactNode;
}

function CardEntity({ user, entity, onClickCard, onClickUser, componentMenu, componentBottom }: Props) {
  const { t } = useTranslation();
  const theme = useMantineTheme();

  return (
    <Card sx={{ overflow: "visible", ...bgColorHover(theme) }} shadow="sm" p="md" m="md" radius="md" withBorder onClick={onClickCard}>
      <Flex direction="row" gap="md">
        <Avatar src={util.generateAvatar(user.username + user.id)} alt="Avatar" radius="xl" />

        <Flex direction="column" sx={flexGrow}>
          <Flex direction="column">
            <Flex align="center" justify="space-between">
              <Flex miw={0} mr={4}>
                <Anchor href={`/profile/${user.username}`} sx={colorBW(theme)} onClick={onClickUser}>
                  <Flex miw={0} sx={autoGrid}>
                    <Text truncate pr={4}><TextParser text={user.name} types={[PieceType.Emoji]} /></Text>
                    <Text>@</Text>
                    <Text truncate>{user.username}</Text>
                  </Flex>
                </Anchor>
              </Flex>

              {componentMenu}
            </Flex>

            {entity.date &&
              <Text size="sm" color="dimmed" truncate>
                <Flex direction="row">
                  <Flex miw={0} sx={autoGrid}>
                    <CustomTooltip label={util.formatDate(entity.date, true)}>
                      <Text>{util.formatDate(entity.date)}</Text>
                    </CustomTooltip>

                    {entity.updateDate !== undefined && entity.updateDate !== -1 &&
                      <CustomTooltip label={util.formatDate(entity.updateDate, true)}>
                        <Text truncate>
                          &nbsp;/&nbsp;
                          {t("discussion.activity")}
                          {util.formatDate(entity.updateDate)}
                        </Text>
                      </CustomTooltip>
                    }
                  </Flex>
                </Flex>
              </Text>
            }
          </Flex>

          {entity.content.length > 0 &&
            <Text sx={wrapContent} my="xs">
              <TextParser text={entity.content} />
            </Text>
          }

          {componentBottom}
        </Flex>
      </Flex>
    </Card >
  )
}

export default CardEntity