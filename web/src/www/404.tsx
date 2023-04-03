import Meta from "@/www/components/Meta";
import WebsiteLayout from "@/www/layouts/WebsiteLayout";

import {
  createStyles,
  Title,
  Text,
  Button,
  Container,
  Group,
  rem,
} from "@mantine/core";

import { IconArrowRight } from "@tabler/icons-react";

const meta = {
  title: "Oops!",
  description: `Something went wrong.`,
  keywords: `not found, 404`,
  url: "/oops",
};

const Home = () => {
  return (
    <WebsiteLayout>
      <Meta {...meta} />
      <main>
        <NotFound />
      </main>
    </WebsiteLayout>
  );
};

export default Home;

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(32),
    paddingBottom: rem(32),
  },

  label: {
    textAlign: "center",
    fontWeight: 900,
    fontSize: rem(200),
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[4]
        : theme.colors.gray[3],

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(100),
    },
  },

  title: {
    textAlign: "center",
    fontWeight: 850,
    fontSize: rem(38),
    color: theme.colorScheme == "dark" ? "white" : theme.colors.dark[9],

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(32),
    },
  },

  description: {
    maxWidth: rem(450),
    margin: "auto",
    fontWeight: 500,
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
  },
}));

export function NotFound() {
  const { classes } = useStyles();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>404</div>
      <Title className={classes.title}>Something's gone wrong.</Title>
      <Text
        color="dimmed"
        size="xl"
        align="center"
        className={classes.description}>
        You may have mistyped the address, or the page has been moved to another
        URL.
      </Text>
      <Group position="center" my={25}>
        <Button
          variant="gradient"
          size="lg"
          radius={20}
          rightIcon={<IconArrowRight />}>
          Go Back Home
        </Button>
      </Group>
    </Container>
  );
}
