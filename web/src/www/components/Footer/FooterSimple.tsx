import { createStyles, Container, Group, Anchor, Box } from "@mantine/core";
import { FunctionComponent } from "react";

export const FooterSimple: FunctionComponent<{
  links: { link: string; label: string }[];
  brand: React.ReactNode;
}> = ({ links, brand }) => {
  const { classes } = style.FooterSimple();

  const items = links.map((link) => (
    <Anchor<"a"> color="dimmed" key={link.label} href={link.link} onClick={(event) => event.preventDefault()} size="sm">
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Group>{items}</Group>
        <Group position="center" mt={10}>
          <Box>{brand}</Box>
        </Group>
      </Container>
    </div>
  );
};

const style = {
  FooterSimple: createStyles((theme) => ({
    footer: {
      marginTop: 16,
      borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]}`,
    },

    inner: {
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,

      [theme.fn.smallerThan("xs")]: {
        flexDirection: "column",
      },
    },
  })),
};
