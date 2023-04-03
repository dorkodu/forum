import { Box, Container, Flex, Group, Paper, Text, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export const SectionTitle = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => {
  return (
    <Container>
      <Group noWrap>
        <Box w={36}>{icon}</Box>
        <div>
          <Title order={2}>{title}</Title>
          <Text>{text}</Text>
        </div>
      </Group>
    </Container>
  );
};

export const StarDivider = () => {
  const theme = useMantineTheme();

  return (
    <Text
      weight={600}
      size="5rem"
      mr={5}
      mt={"2.5rem"}
      mb={"4rem"}
      color={theme.colorScheme == "dark" ? theme.colors.dark[6] : theme.colors.gray[3]}
      sx={{ userSelect: "none" }}
      align="center"
    >
      ꘏
    </Text>
  );
};

export const StoryCard = ({ icon, text, order }: { icon: React.ReactNode; text: React.ReactNode; order: number }) => {
  const theme = useMantineTheme();

  return (
    <Paper
      shadow="sm"
      withBorder
      p="md"
      m={10}
      sx={{
        backgroundColor: theme.colorScheme == "dark" ? theme.colors.dark[8] : theme.white,
      }}
      radius={10}
    >
      <Group position="apart" mb={8}>
        <Box w={36}>{icon}</Box>
        <Text weight={900} size={30} variant="gradient">
          {order}
        </Text>
      </Group>
      <div>{text}</div>
    </Paper>
  );
};

export const punctuation = ["＊", "⁕", "๛", "⹈", "꘏", "꘎", "⋆", "⭑", "☸"];

export const Showcase = ({ content }: { content: [React.ReactNode, React.ReactNode] }) => {
  const isBigScreen = useMediaQuery("(min-width: 760px)");

  return (
    <Container my={50}>
      <Group noWrap={isBigScreen}>
        <div style={{ flex: 1 }}>{content[0]}</div>
        <div style={{ flex: 1.1 }}>{content[1]}</div>
      </Group>
    </Container>
  );
};

export const WIP = () => (
  <Container size={600} my={50}>
    <Title order={2}>Sorry, come back later.</Title>
    <Text>This page is currently under development.</Text>
  </Container>
);
