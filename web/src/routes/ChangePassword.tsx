import { useLayoutEffect, useRef, useState } from "react";
import { useUserStore } from "../stores/userStore";

import {
  createStyles,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Container,
  Group,
  Anchor,
  Center,
  Box,
  Image,
} from "@mantine/core";

import { IconArrowLeft } from "@tabler/icons";

import DorkoduIDKeyIcon from "@assets/dorkodu-id_key.svg";

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

function ChangePassword() {
  const { classes: styles } = useStyles();

  const [done, setDone] = useState(false);
  const user = useUserStore((state) => state.user);
  const queryInitiatePasswordChange = useUserStore(
    (state) => state.queryInitiatePasswordChange
  );

  const changePasswordUsername = useRef<HTMLInputElement>(null);
  const changePasswordEmail = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (!user) return;
    changePasswordUsername.current &&
      (changePasswordUsername.current.value = user.username);
    changePasswordEmail.current &&
      (changePasswordEmail.current.value = user.email);
  }, []);

  const initiateChangePassword = async () => {
    const username = changePasswordUsername.current?.value;
    const email = changePasswordEmail.current?.value;
    if (!username || !email) return;
    if (!(await queryInitiatePasswordChange(username, email))) return;
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
          placeholder="username"
          ref={changePasswordUsername}
          required
        />
        <br />
        <TextInput
          label="Your email"
          placeholder="you@mail.com"
          ref={changePasswordEmail}
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
            onClick={initiateChangePassword}
            size="md"
            radius="lg"
          >
            Change Password
          </Button>
          {done && <p>Mail is sent. Please check your email.</p>}
        </Group>
      </Paper>
    </Container>
  );
}

export default ChangePassword;
