import { Alert, Button, Card, Flex, Text, Textarea } from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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

function CreateComment({ discussionId }: Props) {
  const { t } = useTranslation();
  const state = useAppStore(state => state.options.discussion);

  const queryCreateComment = useDiscussionStore(state => state.queryCreateComment);
  const [actionCommentProps, setActionCommentProps] = useFeedProps();

  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const currentUserId = useAuthStore(state => state.userId);

  const createComment = async () => {
    // If user is trying to vote argument while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (state.comment.length === 0) return;
    if (state.comment.length > 500) return;
    if (actionCommentProps.loading) return;

    setActionCommentProps(s => ({ ...s, loading: true, status: undefined }));
    const status = await useWait(() => queryCreateComment(discussionId, state.comment))();
    setActionCommentProps(s => ({ ...s, loading: false, status: status }));

    if (!status) return;

    // Since it's a controlled component, it's value can't be changed
    // directly with a setComment call, instead it's html property must be changed
    inputReady.current = false;
    if (commentRef.current) commentRef.current.value = "";
    useAppStore.setState(s => { s.options.discussion.comment = "" });
  }

  const changeMode = (value: string) => {
    if (value === "edit" || value === "preview") {
      useAppStore.setState(s => { s.options.discussion.commentMode = value });
    }
  }

  // Necessary stuff for input validation & error messages
  const inputReady = useRef(false);
  const { ref: commentRef, focused: commentFocused } = useFocusWithin();
  useEffect(() => { inputReady.current = commentFocused || inputReady.current }, [commentFocused]);

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        {actionCommentProps.loading && <OverlayLoader />}

        <CardPanel.Segments
          segments={[
            {
              value: state.commentMode,
              setValue: changeMode,
              label: t("mode"),
              data: [
                { label: t("editMode"), value: "edit" },
                { label: t("previewMode"), value: "preview" },
              ]
            }
          ]}
        />

        {state.commentMode === "edit" &&
          <>
            <InputRequirements
              value={state.comment}
              requirements={getRequirement(t, "comment")}
            >
              <Textarea
                radius="md"
                label={`${t("comment.title")} (${state.comment.length} / 500)`}
                placeholder={t("comment.write")}
                defaultValue={state.comment}
                onChange={ev => useAppStore.setState(s => { s.options.discussion.comment = ev.target.value })}
                autosize
                error={inputReady.current && !commentFocused && getRequirementError(t, "comment", state.comment)}
                ref={commentRef}
              />
            </InputRequirements>

            <Flex>
              <Button
                onClick={createComment}
                color="dark"
                radius="md"
              >
                {t("comment.create")}
              </Button>
            </Flex>

            {actionCommentProps.status === false &&
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

        {state.commentMode === "preview" &&
          <Flex direction="column">
            <Text weight={500} size="sm">{t("comment.title")}</Text>
            <Card withBorder>
              <Text css={wrapContent}>
                <TextParser text={state.comment} />
              </Text>
            </Card>
          </Flex>
        }
      </Flex>
    </Card>
  )
}

export default CreateComment