import { createStyles, Group, Menu, rem, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

import en from "@/assets/locales/en/icon.svg";
import tr from "@/assets/locales/tr/icon.svg";
import i18n from "@/lib/i18n";
import { useAppStore } from "@/stores/appStore";

const data = [
  { label: 'English', locale: "en", icon: en },
  { label: 'Türkçe', locale: "tr", icon: tr },
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
  const [opened, setOpened] = useState(false);
  const { classes } = useStyles({ opened });
  const selected = data.filter(datum => datum.locale === i18n.language)[0];
  const changeLocale = useAppStore(state => state.changeLocale);

  const items = data.map((item) => (
    <Menu.Item
      icon={<img src={item.icon} alt={item.label} width={18} height={18} />}
      onClick={() => changeLocale(item.locale)}
      key={item.label}
    >
      {item.label}
    </Menu.Item>
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
            <img src={selected.icon} alt={selected.label} width={22} height={22} />
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