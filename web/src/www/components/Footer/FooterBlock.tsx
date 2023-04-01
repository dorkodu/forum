import { createStyles, Container, Group, Anchor, Box, Image, Stack } from "@mantine/core";
import { FunctionComponent } from "react";
import { Text, ActionIcon } from "@mantine/core";
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconBrandGithub } from "@tabler/icons-react";

export const FooterBlock = () => {
  const { classes, theme } = style.FooterWithLinks();

  const data = [
    {
      title: "Company",
      links: [
        {
          label: "About",
          link: "/about",
        },
        {
          label: "Jobs",
          link: "/jobs",
        },
        {
          label: "Garden",
          link: "/garden",
        },
        {
          label: "For Business",
          link: "/business",
        },
        {
          label: "For Creators",
          link: "/creators",
        },
      ],
    },
    {
      title: "Products",
      links: [
        {
          label: "Wander",
          link: "/product/wander",
        },
        {
          label: "Trekie",
          link: "/product/trekie",
        },
        {
          label: "Forum",
          link: "/product/forum",
        },
        {
          label: "ID",
          link: "/product/id",
        },
      ],
    },
    {
      title: "Resources",
      links: [
        {
          label: "README",
          link: "/readme",
        },
        {
          label: "Terms",
          link: "/terms",
        },

        {
          label: "Privacy",
          link: "/privacy",
        },
        {
          label: "Press",
          link: "/press",
        },
        {
          label: "Open Source",
          link: "https://github.com/dorkodu",
        },
        {
          label: "Contact Us",
          link: "/contact-us",
        },
      ],
    },
  ];

  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text
        key={index}
        className={classes.link}
        component="a"
        href={link.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Image
            src={theme.colorScheme === "dark" ? "/images/dorkodu_Logo_Colorful.svg" : "/images/dorkodu_Logo_Dark.svg"}
            height={40}
            width="auto"
            mb="md"
            fit="unset"
          />
          <Text size={18} weight={400} color="dimmed" className={classes.description}>
            We Are Your{" "}
            <Text weight={500} span>
              Dream Fulfillment Technology
            </Text>{" "}
            Company.
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Stack spacing={4}>
          <Text color="dimmed" size="sm">
            Proudly from humans. 🌎🇹🇷
          </Text>
          <Text color="dimmed" size="md" weight={500}>
            © {new Date().getFullYear()} <span style={{ fontWeight: 800 }}>Dorkodu</span>
          </Text>
        </Stack>

        <Group spacing={0} className={classes.social} position="right" noWrap>
          <ActionIcon size={40} component="a" href="https://twitter.com/dorkodu">
            <IconBrandTwitter size={28} />
          </ActionIcon>
          <ActionIcon size={40} component="a" href="https://github.com/dorkodu">
            <IconBrandGithub size={28} />
          </ActionIcon>
          <ActionIcon size={40} component="a" href="https://youtube.com/@dorkodu">
            <IconBrandYoutube size={28} />
          </ActionIcon>
          <ActionIcon size={40} component="a" href="https://instagram.com/dorkodu">
            <IconBrandInstagram size={28} />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
};

const style = {
  FooterWithLinks: createStyles((theme) => ({
    footer: {
      marginTop: 120,
      paddingTop: +theme.spacing.xl * 2,
      paddingBottom: +theme.spacing.xl * 2,
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[2],
      borderTop: `10px solid ${theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1]}`,
    },

    logo: {
      maxWidth: 320,
      marginLeft: 10,

      [theme.fn.smallerThan("sm")]: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
    },

    description: {
      marginTop: 5,

      [theme.fn.smallerThan("sm")]: {
        marginTop: theme.spacing.xs,
        textAlign: "center",
      },
    },

    inner: {
      display: "flex",
      justifyContent: "space-between",

      [theme.fn.smallerThan("sm")]: {
        flexDirection: "column",
        alignItems: "center",
        rowGap: +theme.spacing.md * 3,
      },
    },

    groups: {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing.xl,
      justifyContent: "space-evenly",

      [theme.fn.smallerThan(500)]: {
        flexDirection: "column",
      },
    },

    wrapper: {
      minWidth: 120,
    },

    link: {
      display: "block",
      color: theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7],
      fontSize: +theme.fontSizes.sm * 1.025,
      paddingTop: 3,
      paddingBottom: 3,

      "&:hover": {
        textDecoration: "underline",
      },
    },

    title: {
      fontSize: theme.fontSizes.md,
      fontWeight: 800,
      textTransform: "uppercase",
      marginBottom: +theme.spacing.xs / 2,
      color: theme.colorScheme === "dark" ? theme.white : theme.colors.dark[6],
    },

    afterFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
      borderTop: `2px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,

      [theme.fn.smallerThan("sm")]: {
        flexDirection: "column",

        "*": {
          textAlign: "center",
        },
      },
    },

    social: {
      [theme.fn.smallerThan("sm")]: {
        marginTop: theme.spacing.xs,
      },
    },
  })),
};
