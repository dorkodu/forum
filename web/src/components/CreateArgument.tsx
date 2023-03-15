import { Alert, Button, Card, Flex, SegmentedControl, Text, Textarea } from "@mantine/core"
import { useFocusWithin } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next"
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { wrapContent } from "../styles/css";
import { CardPanel } from "./cards/CardPanel";
import OverlayLoader from "./cards/OverlayLoader";
import { useFeedProps, useWait } from "./hooks";
import InputRequirements, { getRequirement, getRequirementError } from "./popovers/InputRequirements";
import TextParser from "./TextParser";

interface Props {
  discussionId: string;
}

function CreateArgument({ discussionId }: Props) {
  const { t } = useTranslation();
  const state = useAppStore(state => state.options.discussion);

  const queryCreateArgument = useDiscussionStore(state => state.queryCreateArgument);
  const [actionArgumentProps, setActionArgumentProps] = useFeedProps();

  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const currentUserId = useAuthStore(state => state.userId);

  const createArgument = async () => {
    // If user is trying to vote argument while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (state.argument.length === 0) return;
    if (state.argument.length > 500) return;
    if (actionArgumentProps.loading) return;

    setActionArgumentProps(s => ({ ...s, loading: true, status: undefined }));
    const status = await useWait(() => queryCreateArgument(discussionId, state.argument, state.argumentType))();
    setActionArgumentProps(s => ({ ...s, loading: false, status: status }));

    if (!status) return;

    // Since it's a controlled component, it's value can't be changed
    // directly with a setArgument call, instead it's html property must be changed
    inputReady.current = false;
    if (argumentRef.current) argumentRef.current.value = "";
    useAppStore.setState(s => { s.options.discussion.argument = "" });
  }

  const changeMode = (value: string) => {
    if (value === "edit" || value === "preview") {
      useAppStore.setState(s => { s.options.discussion.argumentMode = value });
    }
  }

  // Necessary stuff for input validation & error messages
  const inputReady = useRef(false);
  const { ref: argumentRef, focused: argumentFocused } = useFocusWithin();
  useEffect(() => { inputReady.current = argumentFocused || inputReady.current }, [argumentFocused]);

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        {actionArgumentProps.loading && <OverlayLoader />}

        <CardPanel.Segments
          segments={[
            {
              value: state.argumentMode,
              setValue: changeMode,
              label: t("mode"),
              data: [
                { label: t("editMode"), value: "edit" },
                { label: t("previewMode"), value: "preview" },
              ]
            }
          ]}
        />

        {state.argumentMode === "edit" &&
          <>
            <InputRequirements
              value={state.argument}
              requirements={getRequirement(t, "argument")}
            >
              <Textarea
                radius="md"
                label={`${t("argument.title")} (${state.argument.length} / 500)`}
                placeholder={t("argument.write")}
                defaultValue={state.argument}
                onChange={ev => useAppStore.setState(s => { s.options.discussion.argument = ev.target.value })}
                autosize
                error={inputReady.current && !argumentFocused && getRequirementError(t, "argument", state.argument)}
                ref={argumentRef}
              />
            </InputRequirements>

            <Flex>
              <Button onClick={createArgument} color="dark" radius="md" mr="md">{t("argument.create")}</Button>

              <SegmentedControl radius="md"
                value={state.argumentType ? "+" : "-"}
                onChange={(type: "+" | "-") => useAppStore.setState(s => { s.options.discussion.argumentType = type === "+" })}
                data={[
                  { label: "+", value: "+" },
                  { label: "-", value: "-" },
                ]}
              />
            </Flex>

            {actionArgumentProps.status === false &&
              <Alert
                icon={<IconAlertCircle size={24} />}
                title={t("error.text")}
                color="red"
                variant="light"
              >
                {t("error.default")}
              </Alert>
            }
          </>
        }

        {state.argumentMode === "preview" &&
          <Flex direction="column">
            <Text weight={500} size="sm">{t("argument.title")}</Text>
            <Card withBorder>
              <Text css={wrapContent}>
                <TextParser text={state.argument} />
              </Text>
            </Card>
          </Flex>
        }
      </Flex>
    </Card>
  )
}

export default CreateArgument