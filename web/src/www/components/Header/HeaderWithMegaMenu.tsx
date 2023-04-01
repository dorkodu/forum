import {
  Anchor,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  Header,
  HoverCard,
  ScrollArea,
  SimpleGrid,
  Text,
  UnstyledButton,
  createStyles,
  Title,
  Stack,
  Image,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";

import {
  IconArrowBigRightLine,
  IconArrowBigRightLineFilled,
  IconBriefcase,
  IconBriefcaseOff,
  IconBuildingCommunity,
  IconBusinessplan,
  IconCake,
  IconCampfire,
  IconChevronDown,
  IconChevronRight,
  IconCircleArrowRightFilled,
  IconHeartHandshake,
  IconLicense,
  IconMasksTheater,
  IconPlant,
  IconPlant2,
  IconSquareRoundedArrowRight,
  IconSquareRoundedArrowRightFilled,
  IconTrees,
} from "@tabler/icons-react";

import { useDisclosure } from "@mantine/hooks";
import { FunctionComponent } from "react";

import DorkoduLogo from "@/assets/dorkodu/dorkodu_Logo_Colorful.svg";
import { ColorToggleSegment, ColorToggleSwitch } from "../ColorToggle";
import { tokens } from "@dorkodu/prism";
import Link from "next/link";

const links = {
  product: [
    {
      link: "/products/forum",
      icon: <Image src="/images/logos/forum_Icon.svg" width={48} height={48} alt="Forum" withPlaceholder />,
      title: "Forum",
      description: "Social Discourse",
    },
    {
      link: "/products/id",
      icon: <Image src="/images/logos/id_Icon.svg" width={48} height={48} alt="Dorkodu ID" withPlaceholder />,
      title: "ID",
      description: "Your Digital Identity",
    },
  ],
  company: [
    {
      link: "/jobs",
      icon: (
        <ThemeIcon variant="light" radius="md" size="lg" color="green">
          <IconBriefcase />
        </ThemeIcon>
      ),
      title: "Jobs",
      description: "Join the revolution.",
    },
    {
      link: "/readme",
      icon: (
        <ThemeIcon variant="light" radius="md" size="lg" color="green">
          <IconLicense />
        </ThemeIcon>
      ),
      title: "README",
      description: "The Dorkodu Manifesto",
    },
    {
      link: "/garden",
      icon: (
        <ThemeIcon variant="light" radius="md" size="lg" color="green">
          <IconPlant />
        </ThemeIcon>
      ),
      title: "Garden",
      description: "Our ideas, public.",
    },
  ],
  business: [
    {
      link: "/business",
      icon: (
        <ThemeIcon variant="light" radius="md" size="lg" color="green">
          <IconBuildingCommunity stroke={2.25} />
        </ThemeIcon>
      ),
      title: "For Business",
      description: "Grow together.",
    },
    {
      link: "/creators",
      icon: (
        <ThemeIcon variant="light" radius="md" size="lg" color="green">
          <IconHeartHandshake stroke={2} />
        </ThemeIcon>
      ),
      title: "For Creators",
      description: "Create together.",
    },
  ],
};

export const HeaderWithMegaMenu: FunctionComponent = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [productLinksOpened, { toggle: toggleProductLinks }] = useDisclosure(false);
  const [companyLinksOpened, { toggle: toggleCompanyLinks }] = useDisclosure(false);

  const { classes, theme } = useStyles();

  const MenuButtonsWithIcon = (
    list: Array<{
      icon: React.ReactNode;
      title: string;
      description: string;
      link: string;
    }>
  ) => {
    return list.map((item) => (
      <Link href={item.link} key={item.title}>
        <UnstyledButton className={classes.subLink}>
          <Group noWrap align="center">
            {item.icon}

            <div>
              <Text size="sm" weight={500} color={theme.colorScheme == "dark" ? theme.white : theme.colors.dark[9]}>
                {item.title}
              </Text>
              <Text size="xs" color="dimmed" weight={450}>
                {item.description}
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Link>
    ));
  };

  return (
    <Box pb={75}>
      <Header height="auto" px="md" withBorder={false}>
        <Group
          position="apart"
          sx={{
            height: "100%",
            maxWidth: 920,
            marginLeft: "auto",
            marginRight: "auto",
            paddingTop: 15,
            paddingBottom: 15,
          }}
        >
          <Link href="/">
            <Image src="/images/dorkodu_Logo_Colorful.svg" alt="Dorkodu" height={40} />
          </Link>

          <Group sx={{ height: "100%" }} spacing={0} className={classes.hiddenMobile}>
            <Link href="/about" className={classes.link}>
              About
            </Link>

            <HoverCard width={500} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <UnstyledButton className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Our Work
                    </Box>
                    <IconChevronDown size={18} color={theme.colors.gray[5]} />
                  </Center>
                </UnstyledButton>
              </HoverCard.Target>

              <HoverCard.Dropdown sx={{ overflow: "hidden", marginTop: 16 }} p="sm">
                <Group position="apart" px="md">
                  <Text weight={600}>Products</Text>
                </Group>
                <Divider my="sm" mx="-md" color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"} />
                <SimpleGrid cols={2} spacing={0}>
                  {MenuButtonsWithIcon(links.product)}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group position="apart">
                    <div>
                      <Text weight={500} size="sm">
                        Get started
                      </Text>
                      <Text size="xs" color="dimmed">
                        Create an account to start using Dorkodu.
                      </Text>
                    </div>
                    <Button variant="default">Create Account</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>

            <HoverCard width={250} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <a className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Company
                    </Box>
                    <IconChevronDown size={18} color={theme.colors.gray[5]} />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown sx={{ overflow: "hidden" }} p={8}>
                <Stack spacing={0}>
                  {MenuButtonsWithIcon(links.company)}
                  <Divider my={8} color={theme.colorScheme === "dark" ? "dark.4" : "gray.2"} />
                  {MenuButtonsWithIcon(links.business)}
                </Stack>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>

          <Group className={classes.hiddenMobile} spacing={8}>
            <ColorToggleSwitch size="md" />
            {/* <Button radius={theme.radius.lg - 2} rightIcon={<IconCircleArrowRightFilled />}>Enter</Button> */}
            <Button variant="default" radius={Number(theme.radius.lg) - 1}>
              Log In
            </Button>
            <Button radius={Number(theme.radius.lg) - 1}>Sign Up</Button>
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            size="md"
            color={theme.colorScheme === "dark" ? tokens.color.gray(75) : tokens.color.gray(20)}
            className={classes.hiddenDesktop}
          />
        </Group>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="75%"
        padding="md"
        className={classes.hiddenDesktop}
        zIndex={1000000}
        title={
          <Group position="apart">
            <Title order={2} size="h3">
              Dorkodu
            </Title>
            <ColorToggleSwitch size="md" />
          </Group>
        }
      >
        <ScrollArea sx={{ height: "calc(100vh - 60px)" }} mx="-md">
          <a href="#" className={classes.link}>
            <span>About</span>
          </a>

          <UnstyledButton className={classes.link} onClick={toggleProductLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Products
              </Box>
              <IconChevronDown size={16} color={theme.colors.gray[5]} stroke={3} />
            </Center>
          </UnstyledButton>
          <Collapse in={productLinksOpened}>{MenuButtonsWithIcon(links.product)}</Collapse>

          <UnstyledButton className={classes.link} onClick={toggleCompanyLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Company
              </Box>
              <IconChevronDown size={16} color={theme.colors.gray[5]} stroke={3} />
            </Center>
          </UnstyledButton>
          <Collapse in={companyLinksOpened}>
            {MenuButtonsWithIcon(links.company)}
            {MenuButtonsWithIcon(links.business)}
          </Collapse>

          <Divider my="sm" color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"} />

          <Group position="center" spacing="xs" grow pb="xl" px={0}>
            <Button variant="default" radius={Number(theme.radius.lg) - 1}>
              Log In
            </Button>
            <Button radius={Number(theme.radius.lg) - 1}>Sign Up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
    textDecoration: "none",
    borderRadius: theme.spacing.sm,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,
    cursor: "pointer",

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      color: theme.colorScheme === "dark" ? theme.colors.white : theme.colors.green[9],
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.green[1],
      textDecoration: "underline",
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[1],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[1],
    margin: -theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md}px ${Number(theme.spacing.md) * 2}px`,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]}`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
}));
