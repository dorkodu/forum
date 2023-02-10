import { Button, Card, Flex, SegmentedControl, Textarea } from "@mantine/core";
import { IconArrowBigDownLine, IconArrowBigUpLine, IconRefresh } from "@tabler/icons";
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { wrapContent } from "../styles/css";
import Argument from "./Argument";
import CardAlert from "./cards/CardAlert";
import CardLoader from "./cards/CardLoader";
import { CardPanel } from "./cards/CardPanel";
import OverlayLoader from "./cards/OverlayLoader";
import Comment from "./Comment"
import DiscussionSummary from "./DiscussionSummary";
import { useWait } from "./hooks";
import InfiniteScroll from "./InfiniteScroll";
import TextParser from "./TextParser";

interface Props {
  discussionId: string | undefined;
}

interface State {
  discussion: { loading: boolean, status: boolean | undefined };

  fetchArgument: { loading: boolean, status: boolean | undefined };
  fetchComment: { loading: boolean, status: boolean | undefined };

  actionArgument: { loading: boolean, status: boolean | undefined };
  actionComment: { loading: boolean, status: boolean | undefined };

  show: "comments" | "arguments";
  commentType: "newer" | "older";
  argumentType: "newer" | "older" | "top" | "bottom";

  argument: { text: string, type: boolean };
  comment: { text: string };

  loader: "top" | "bottom" | "mid" | undefined;
}

function Discussion({ discussionId }: Props) {
  const [state, setState] = useState<State>({
    discussion: { loading: true, status: undefined },

    fetchArgument: { loading: false, status: undefined },
    fetchComment: { loading: false, status: undefined },

    actionArgument: { loading: false, status: undefined },
    actionComment: { loading: false, status: undefined },

    show: "arguments",
    argumentType: "newer",
    commentType: "newer",

    argument: { text: "", type: true },
    comment: { text: "" },

    loader: "mid",
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

  const argumentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const getDiscussion = async () => {
    setState(s => ({
      ...s, discussion: { ...s.discussion, loading: true, status: undefined },
      loader: "mid"
    }));

    const status = await useWait(() => queryGetDiscussion(discussionId))();

    setState(s => ({
      ...s, discussion: { ...s.discussion, loading: false, status: status },
      loader: undefined
    }));
  }

  const createArgument = async () => {
    // If user is trying to create argument while not being logged in
    if (!currentUserId) return requestLogin(true);

    if (state.argument.text.length === 0) return;
    if (state.argument.text.length > 500) return;
    if (!discussion) return;
    if (state.actionArgument.loading) return;

    setState(s => ({ ...s, actionArgument: { ...s.actionArgument, loading: true, status: undefined } }));
    const status = await useWait(() => queryCreateArgument(discussion.id, state.argument.text, state.argument.type))();
    setState(s => ({ ...s, actionArgument: { ...s.actionArgument, loading: false, status: status } }));

    // Since it's a controlled component, it's value can't be changed
    // directly with a setState call, instead it's html property must be changed
    if (argumentInputRef.current) argumentInputRef.current.value = "";
    setState(s => ({ ...s, argument: { ...s.argument, text: "" } }));
  }

  const createComment = async () => {
    // If user is trying to create comment while not being logged in
    if (!currentUserId) return requestLogin(true);

    if (state.comment.text.length === 0) return;
    if (state.comment.text.length > 500) return;
    if (!discussion) return;
    if (state.actionComment.loading) return;

    setState(s => ({ ...s, actionComment: { ...s.actionComment, loading: true, status: undefined } }));
    const status = await useWait(() => queryCreateComment(discussion.id, state.comment.text))();
    setState(s => ({ ...s, actionComment: { ...s.actionComment, loading: false, status: status } }));

    // Since it's a controlled component, it's value can't be changed
    // directly with a setState call, instead it's html property must be changed
    if (commentInputRef.current) commentInputRef.current.value = "";
    setState(s => ({ ...s, comment: { ...s.comment, text: "" } }));
  }

  const getArguments = async (type: "newer" | "older" | "top" | "bottom", refresh?: boolean) => {
    if (!discussion) return;
    if (state.fetchArgument.loading) return;

    setState(s => ({
      ...s,
      fetchArgument: { ...s.fetchArgument, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
    }));
    const status = await useWait(() => queryGetArguments(discussion.id, type, refresh))();
    setState(s => ({
      ...s,
      fetchArgument: { ...s.fetchArgument, loading: false, status: status },
      loader: undefined,
    }));
  }

  const getComments = async (type: "newer" | "older", refresh?: boolean) => {
    if (!discussion) return;
    if (state.fetchComment.loading) return;

    setState(s => ({
      ...s,
      fetchComment: { ...s.fetchComment, loading: true, status: undefined },
      loader: refresh ? "mid" : type === "newer" ? "top" : "bottom",
    }));
    const status = await useWait(() => queryGetComments(discussion.id, type, refresh))();
    setState(s => ({
      ...s,
      fetchComment: { ...s.fetchComment, loading: false, status: status },
      loader: undefined,
    }));
  }

  const refresh = async (show: typeof state.show) => {
    switch (show) {
      case "arguments": await getArguments("newer", true); break;
      case "comments": await getComments("newer", true); break;
    }
  }

  const loadNewer = async () => {
    switch (state.show) {
      case "arguments": await getArguments("newer"); break;
      case "comments": await getComments("newer"); break;
    }
  }

  const loadOlder = async () => {
    switch (state.show) {
      case "arguments": await getArguments("older"); break;
      case "comments": await getComments("older"); break;
    }
  }

  const show = (show: typeof state.show) => {
    switch (show) {
      case "arguments": return _arguments;
      case "comments": return comments;
    }
  }

  const changeShow = (value: string) => {
    if (value === "arguments" || value === "comments") {
      setState(s => ({ ...s, show: value }));
      if (show(value).length === 0) refresh(value);
    }
  }

  const changeType = (value: string) => {
    if (state.show === "arguments") {
      setState(s => ({ ...s, argumentType: value as typeof state.argumentType }));
    }
    else if (state.show === "comments") {
      setState(s => ({ ...s, commentType: value as typeof state.commentType }));
    }
  }

  const isActionLoading = () => {
    switch (state.show) {
      case "arguments": return state.actionArgument.loading;
      case "comments": return state.actionComment.loading;
    }
  }

  useEffect(() => { getDiscussion() }, []);

  if (!discussion || state.discussion.loading) {
    return (
      <>
        {state.discussion.loading && <CardLoader />}
        {!state.discussion.loading && state.discussion.status === false &&
          <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
        }
      </>
    )
  }

  return (
    <>
      <DiscussionSummary discussionId={discussionId} />

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder css={wrapContent}>
        <TextParser text={discussion.readme} />
      </Card>

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        <Flex direction="column" gap="md">

          <CardPanel.Segments
            segments={[
              {
                value: state.show,
                setValue: changeShow,
                label: t("show"),
                data: [
                  { label: t("argument.plural"), value: "arguments" },
                  { label: t("comment.plural"), value: "comments" },
                ]
              }
            ]}
          />

          {state.show === "arguments" &&
            <CardPanel.Segments
              segments={[
                {
                  value: state.argumentType,
                  setValue: changeType,
                  label: t("order"),
                  data: [
                    { label: t("newer"), value: "newer" },
                    { label: t("older"), value: "older" },
                    { label: t("mostVoted"), value: "top" },
                    { label: t("leastVoted"), value: "bottom" },
                  ]
                }
              ]}
            />
          }

          {state.show === "comments" &&
            <CardPanel.Segments
              segments={[
                {
                  value: state.commentType,
                  setValue: changeType,
                  label: t("order"),
                  data: [
                    { label: t("newer"), value: "newer" },
                    { label: t("older"), value: "older" },
                  ]
                }
              ]}
            />
          }

          <CardPanel.Buttons
            buttons={[
              { onClick: () => refresh(state.show), text: <IconRefresh /> },
              {
                onClick: loadNewer,
                text: <IconArrowBigDownLine />,
                disabled: state.show === "arguments" && ["top", "bottom"].includes(state.argumentType)
              },
              {
                onClick: loadOlder,
                text: <IconArrowBigUpLine />,
                disabled: state.show === "arguments" && ["top", "bottom"].includes(state.argumentType)
              },
            ]}
          />
        </Flex>
      </Card>

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        {isActionLoading() && <OverlayLoader />}

        {state.show === "arguments" &&
          <>
            <Textarea
              radius="md"
              label={`${t("argument.title")} (${state.argument.text.length} / 500)`}
              description={t("argument.description")}
              placeholder={t("argument.write")}
              ref={argumentInputRef}
              defaultValue={state.argument.text}
              onChange={(ev) => setState(s => ({ ...s, argument: { ...s.argument, text: ev.target.value } }))}
              autosize
              pb="md"
            />

            <Button onClick={createArgument} color="dark" radius="md" mr="md">{t("argument.create")}</Button>

            <SegmentedControl radius="md"
              value={state.argument.type ? "+" : "-"}
              onChange={(type: "+" | "-") => setState(s => ({ ...s, argument: { ...s.argument, type: type === "+" } }))}
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
              label={`${t("comment.title")} (${state.comment.text.length} / 500)`}
              description={t("comment.description")}
              placeholder={t("comment.write")}
              ref={commentInputRef}
              defaultValue={state.comment.text}
              onChange={(ev) => setState(s => ({ ...s, comment: { ...s.comment, text: ev.target.value } }))}
              autosize
              pb="md"
            />

            <Button onClick={createComment} color="dark" radius="md" mr="md">{t("comment.create")}</Button>
          </>
        }
      </Card>

      <InfiniteScroll
        onTop={loadNewer}
        onBottom={loadOlder}
        loaders={{ top: state.loader === "top", bottom: state.loader === "bottom", mid: state.loader === "mid", }}
      >
        {state.show === "arguments" && _arguments.map((argument) => <Argument key={argument.id} argumentId={argument.id} />)}
        {state.show === "comments" && comments.map((comment) => <Comment key={comment.id} commentId={comment.id} />)}
      </InfiniteScroll>
    </>
  )
}

export default Discussion