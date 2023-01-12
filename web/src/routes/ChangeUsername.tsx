import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  createStyles,
  Group,
  Image,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons";
import { useRef, useState } from "react";
import { useUserStore } from "../stores/userStore";

const useStyles = createStyles((theme) => ({
  controls: {
    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column-reverse",
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      textAlign: "center",
    },
  },
}));

function ChangeUsername() {
  const { classes: styles } = useStyles();

  const [done, setDone] = useState(false);
  const queryChangeUsername = useUserStore(
    (state) => state.queryChangeUsername
  );

  const changeUsernameUsername = useRef<HTMLInputElement>(null);

  const changeUsername = async () => {
    const username = changeUsernameUsername.current?.value;
    if (!username) return;
    if (!(await queryChangeUsername(username))) return;
    setDone(true);
  };

  return (
    <Container size={460} my={30}>
      <Image
        src={DorkoduIDKeyIcon}
        width={100}
        sx={{
          marginBottom: "1.5rem",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />

      <Title order={1} align="center" mb={5}>
        Forgot your password?
      </Title>
      <Text color="dimmed" size="lg" align="center" weight={500}>
        Enter your email to get a reset link.
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <TextInput
          label="Your username"
          placeholder="New Username"
          ref={changeUsernameUsername}
          required
        />

        <Group position="apart" mt="lg" className={styles.controls}>
          <Anchor color="dimmed" size="md" className={styles.control}>
            <Center inline>
              <IconArrowLeft size={16} stroke={2.5} />
              <Box ml={5}>Back to login page</Box>
            </Center>
          </Anchor>
          <Button
            className={styles.control}
            onClick={changeUsername}
            size="md"
            radius="lg"
          >
            Change Password
          </Button>
          {done && <p>username is changed.</p>}
        </Group>
      </Paper>
    </Container>
  );
}

export default ChangeUsername;
