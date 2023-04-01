import { FAQ, faqs } from "@/data/faq";

import { Container, Title, Accordion, createStyles, rem, ThemeIcon, useMantineTheme } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

export function FAQs() {
  const theme = useMantineTheme();

  return (
    <Container size="sm">
      <Title align="center" sx={{ marginBottom: 20 }} order={2}>
        FAQs
      </Title>
      <FAQsAccordion faqs={faqs} />
    </Container>
  );
}

export function FAQsAccordion({ faqs }: { faqs: FAQ[] }) {
  const theme = useMantineTheme();
  return (
    <Accordion
      variant="separated"
      chevronSize={32}
      chevron={<IconChevronDown size={24} color={theme.colors.gray[6]} />}
      multiple
      styles={{
        item: {
          borderRadius: theme.radius.md,
          marginBottom: theme.spacing.lg,
          border: `${rem(1)} solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]}`,
          boxShadow: `2px 2px 8px ${theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[2]}`,
        },
        itemTitle: {},
        label: {
          fontWeight: 500,
          paddingLeft: 16,
          borderRadius: 8,
        },
      }}
    >
      {faqs.map((faq, index) => (
        <Accordion.Item value={faq.q} key={index}>
          <Accordion.Control>{faq.q}</Accordion.Control>
          <Accordion.Panel>{faq.a}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
