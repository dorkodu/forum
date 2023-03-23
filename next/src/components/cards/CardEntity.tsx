import { IUser } from "@/types/user";
import { Anchor, Avatar, Card, Flex, Text, useMantineTheme } from "@mantine/core"
import { useTranslation } from "react-i18next";
import { autoGrid, bgColorHover, colorBW, flexGrow, wrapContent } from "../../styles/css"
import AvatarWebp from "../../assets/avatar.webp";
import TextParser, { PieceType } from "../TextParser";
import CustomTooltip from "../custom/CustomTooltip";
import { useRouter } from "next/router";
import { util } from "@/lib/web/util";

interface Props {
  user: IUser;
  entity: {
    date?: number,
    updateDate?: number,
    content: string,
  };

  componentMenu: React.ReactNode;
  componentBottom?: React.ReactNode;
}

function CardEntity({ user, entity, componentMenu, componentBottom }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useMantineTheme();

  return (
    <Card sx={{ overflow: "visible", ...bgColorHover(theme) }} shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="row" gap="md">
        <Avatar src={AvatarWebp.src} alt="Avatar" radius="xl" />

        <Flex direction="column" sx={flexGrow}>
          <Flex direction="column">
            <Flex align="center" justify="space-between">
              <Flex miw={0} mr={4}>
                <Anchor href={`/profile/${user.username}`} sx={colorBW(theme)}>
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
                    <CustomTooltip label={util.formatDate(router.locale, entity.date, true)}>
                      <Text>{util.formatDate(router.locale, entity.date)}</Text>
                    </CustomTooltip>

                    {entity.updateDate !== undefined && entity.updateDate !== -1 &&
                      <CustomTooltip label={util.formatDate(router.locale, entity.updateDate, true)}>
                        <Text truncate>
                          &nbsp;/&nbsp;
                          {t("discussion.activity")}
                          {util.formatDate(router.locale, entity.updateDate)}
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
    </Card>
  )
}

export default CardEntity