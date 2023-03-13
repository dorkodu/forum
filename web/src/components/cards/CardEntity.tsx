import { IUser } from "@api/types/user";
import { css } from "@emotion/react"
import { Anchor, Avatar, Card, Flex, Text, useMantineTheme } from "@mantine/core"
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { date } from "../../lib/date";
import { autoGrid, bgColorHover, colorBW, flexGrow, wrapContent } from "../../styles/css"
import AvatarWebp from "../../assets/avatar.webp";
import TextParser, { PieceType } from "../TextParser";

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
    <Card css={css`overflow: visible; ${bgColorHover(theme)}`} shadow="sm" p="md" m="md" radius="md" withBorder onClick={onClickCard}>
      <Flex direction="row" gap="md">
        <Avatar src={AvatarWebp} alt="Avatar" radius="xl" />

        <Flex direction="column" css={flexGrow}>
          <Flex direction="column">
            <Flex align="center" justify="space-between">
              <Flex miw={0} mr={4}>
                <Anchor href={`/profile/${user.username}`} css={colorBW(theme)} onClick={onClickUser}>
                  <Flex miw={0} css={autoGrid}>
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
                  <Flex miw={0} css={autoGrid}>
                    <Text title={date(entity.date).format('lll')}>{date(entity.date).fromNow()}</Text>
                    {entity.updateDate !== undefined && entity.updateDate !== -1 &&
                      <Text truncate title={date(entity.updateDate).format('lll')}>
                        &nbsp;/&nbsp;
                        {t("discussion.activity")}
                        {date(entity.updateDate).fromNow()}
                      </Text>
                    }
                  </Flex>
                </Flex>
              </Text>
            }
          </Flex>

          {entity.content.length > 0 &&
            <Text css={wrapContent} my="xs">
              <TextParser text={entity.content} />
            </Text>
          }

          {componentBottom}
        </Flex>
      </Flex>
    </Card>
  )
}

export default CardEntity