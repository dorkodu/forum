import { createStyles, Group, Menu, rem, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/router";
import CustomLink from "./custom/CustomLink";

import en from "@/assets/locales/en.svg";
import tr from "@/assets/locales/tr.svg";

const data = [
  { label: 'English', locale: "en", image: en },
  { label: 'Türkçe', locale: "tr", image: tr },
];

const useStyles = createStyles((theme, { opened }: { opened: boolean }) => ({
  control: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,
    border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2]}`,
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[opened ? 5 : 6]
        : opened
          ? theme.colors.gray[0]
          : theme.white,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
    },
  },

  label: {
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
  },

  icon: {
    transition: 'transform 150ms ease',
    transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
  },
}));

function LanguagePicker() {
  const { locale, pathname } = useRouter();

  const [opened, setOpened] = useState(false);
  const { classes } = useStyles({ opened });
  const [selected, setSelected] = useState(data.filter(datum => datum.locale === locale)[0]);
  const items = data.map((item) => (
    <CustomLink href={pathname} locale={item.locale} key={item.label}>
      <Menu.Item
        icon={<Image src={item.image} alt={item.label} width={18} height={18} />}
        onClick={() => setSelected(item)}
      >
        {item.label}
      </Menu.Item>
    </CustomLink>
  ));

  if (!selected) return null;

  return (
    <Menu
      onOpen={() => setOpened(true)}
      onClose={() => setOpened(false)}
      radius="md"
      width="target"
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton className={classes.control}>
          <Group spacing="xs" mr="xs">
            <Image src={selected.image} alt={selected.label} width={22} height={22} />
            <span className={classes.label}>{selected.label}</span>
          </Group>
          <IconChevronDown size="1rem" className={classes.icon} stroke={1.5} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>{items}</Menu.Dropdown>
    </Menu>
  );
}

export default LanguagePicker