import { Button, Card, Flex, LoadingOverlay, SegmentedControl, Textarea } from "@mantine/core";
import { useEffect, useReducer } from "react"
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import Argument from "./Argument";
import Comment from "./Comment"
import DiscussionSummary from "./DiscussionSummary";

interface Props {
  discussionId: string | undefined;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
  action: { loading: boolean, status: boolean | undefined };

  show: "comments" | "arguments";

  commentType: "newer" | "older";
  argumentType: "newer" | "older" | "top" | "bottom";

  argument: { text: string, type: boolean };
  comment: { text: string };
}

function Discussion({ discussionId }: Props) {
  const [state, setState] = useReducer((prev: State, next: State) => {
    const newState = { ...prev, ...next };

    if (newState.comment.text.length > 500)
      newState.comment.text = newState.comment.text.substring(0, 500);

    if (newState.argument.text.length > 500)
      newState.argument.text = newState.argument.text.substring(0, 500);

    return newState;
  }, {
    loading: true,
    status: false,
    action: { loading: false, status: undefined },

    show: "arguments",
    argumentType: "newer",
    commentType: "newer",

    argument: { text: "", type: true },
    comment: { text: "" },
  });

  const { t } = useTranslation();

  const requestLogin = useAppStore(state => state.requestLogin);
  const currentUserId = useAuthStore(state => state.userId);

  const queryGetDiscussion = useDiscussionStore(state => state.queryGetDiscussion);
  const queryGetArguments = useDiscussionStore(state => state.queryGetArguments);
  const queryGetComments = useDiscussionStore(state => state.queryGetComments);
  const queryCreateArgument = useDiscussionStore(state => state.queryCreateArgument);
  const queryCreateComment = useDiscussionStore(state => state.queryCreateComment);

  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const comments = useDiscussionStore(_state => _state.getComments(discussionId, state.commentType));
  const _arguments = useDiscussionStore(_state => _state.getArguments(discussionId, state.argumentType));

  const createArgument = async () => {
    // If user is trying to create argument while not being logged in
    if (!currentUserId) return requestLogin(true);

    if (state.argument.text.length === 0) return;
    if (state.argument.text.length > 500) return;
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryCreateArgument(discussion.id, state.argument.text, state.argument.type);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  const createComment = async () => {
    // If user is trying to create comment while not being logged in
    if (!currentUserId) return requestLogin(true);

    if (state.comment.text.length === 0) return;
    if (state.comment.text.length > 500) return;
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryCreateComment(discussion.id, state.comment.text);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  const getArguments = async (type: "newer" | "older" | "top" | "bottom", refresh?: boolean) => {
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryGetArguments(discussion.id, type, refresh);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  const getComments = async (type: "newer" | "older", refresh?: boolean) => {
    if (!discussion) return;
    if (state.action.loading) return;

    setState({ ...state, action: { ...state.action, loading: true, status: undefined } });
    const status = await queryGetComments(discussion.id, type, refresh);
    setState({ ...state, action: { ...state.action, loading: false, status: status } });
  }

  useEffect(() => {
    (async () => {
      setState({ ...state, loading: true, status: undefined });
      const status = await queryGetDiscussion(discussionId);
      setState({ ...state, loading: false, status: status });
    })()
  }, [])

  if (!discussion) {
    return (
      <>
        {state.loading && <>loading...</>}
        {state.status === false && <>fail...</>}
        {!state.loading && state.status && <>deleted...</>}
      </>
    )
  }

  return (
    <>
      <DiscussionSummary discussionId={discussionId} />

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>{discussion.readme}</Card>

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <Flex direction="column" gap="md">
          <SegmentedControl radius="md" fullWidth
            value={state.show}
            onChange={(show: typeof state.show) => setState({ ...state, show })}
            data={[
              { label: t("showArguments"), value: "arguments" },
              { label: t("showComments"), value: "comments" },
            ]}
          />

          {state.show === "arguments" &&
            <>
              <SegmentedControl radius="md" fullWidth
                value={state.argumentType}
                onChange={(argumentType: typeof state.argumentType) => setState({ ...state, argumentType })}
                data={[
                  { label: t("newer"), value: "newer" },
                  { label: t("older"), value: "older" },
                  { label: t("mostVoted"), value: "top" },
                  { label: t("leastVoted"), value: "bottom" },
                ]}
              />

              <Button.Group>
                <Button radius="md" fullWidth variant="default" onClick={() => getArguments(state.argumentType, true)}>{t("refresh")}</Button>
                <Button radius="md" disabled={(state.argumentType !== "newer" && state.argumentType !== "older")} fullWidth variant="default" onClick={() => getArguments("newer")}>{t("loadNewer")}</Button>
                <Button radius="md" disabled={(state.argumentType !== "newer" && state.argumentType !== "older")} fullWidth variant="default" onClick={() => getArguments("older")}>{t("loadOlder")}</Button>
              </Button.Group>
            </>
          }

          {state.show === "comments" &&
            <>
              <SegmentedControl radius="md" fullWidth
                value={state.commentType}
                onChange={(commentType: typeof state.commentType) => setState({ ...state, commentType })}
                data={[
                  { label: t("newer"), value: "newer" },
                  { label: t("older"), value: "older" },
                ]}
              />

              <Button.Group >
                <Button radius="md" fullWidth variant="default" onClick={() => getComments("newer", true)}>{t("refresh")}</Button>
                <Button radius="md" fullWidth variant="default" onClick={() => getComments("newer")}>{t("loadNewer")}</Button>
                <Button radius="md" fullWidth variant="default" onClick={() => getComments("older")}>{t("loadOlder")}</Button>
              </Button.Group>
            </>
          }
        </Flex>
      </Card>

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <LoadingOverlay visible={state.action.loading} overlayBlur={2} />

        {state.show === "arguments" &&
          <>
            <Textarea
              radius="md"
              placeholder={t("writeArgument")}
              defaultValue={state.argument.text}
              onChange={(ev) => setState({ ...state, argument: { ...state.argument, text: ev.target.value } })}
              autosize
              pb="md"
            />

            <Button onClick={createArgument} color="dark" radius="md" mr="md">{t("createArgument")}</Button>

            <SegmentedControl radius="md"
              value={state.argument.type ? "+" : "-"}
              onChange={(type: "+" | "-") => setState({ ...state, argument: { ...state.argument, type: type === "+" } })}
              data={[
                { label: "+", value: "+" },
                { label: "-", value: "-" },
              ]}
            />
          </>
        }
        {state.show === "comments" &&
          <>
            <Textarea
              radius="md"
              placeholder={t("writeComment")}
              defaultValue={state.comment.text}
              onChange={(ev) => setState({ ...state, comment: { ...state.comment, text: ev.target.value } })}
              autosize
              pb="md"
            />

            <Button onClick={createComment} color="dark" radius="md" mr="md">{t("createComment")}</Button>
          </>
        }
      </Card>

      {state.show === "arguments" && _arguments.map((argument) => <Argument key={argument.id} argumentId={argument.id} />)}
      {state.show === "comments" && comments.map((comment) => <Comment key={comment.id} commentId={comment.id} />)}
    </>
  )
}

export default Discussion