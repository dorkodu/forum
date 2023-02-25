import { Button, Card, Flex, SegmentedControl, Textarea } from "@mantine/core";
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
import { useFeedProps, useWait } from "./hooks";
import InfiniteScroll from "./InfiniteScroll";
import TextParser from "./TextParser";

interface Props {
  discussionId: string | undefined;
}

interface State {
  show: "comments" | "arguments";
  commentType: "newer" | "older";
  argumentType: "newer" | "older" | "top" | "bottom";

  argument: { text: string, type: boolean };
  comment: { text: string };
}

function Discussion({ discussionId }: Props) {
  const [state, setState] = useState<State>({
    show: "arguments",
    argumentType: "newer",
    commentType: "newer",

    argument: { text: "", type: true },
    comment: { text: "" },
  });

  const { t } = useTranslation();

  const setRequestLogin = useAppStore(state => state.setRequestLogin);
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

  const [discussionProps, setDiscussionProps] = useFeedProps({ loader: "top" });

  const [fetchArgumentProps, setFetchArgumentProps] = useFeedProps();
  const [fetchCommentProps, setFetchCommentProps] = useFeedProps();

  const [actionArgumentProps, setActionArgumentProps] = useFeedProps();
  const [actionCommentProps, setActionCommentProps] = useFeedProps();

  const getDiscussion = async () => {
    setDiscussionProps(s => ({ ...s, loader: "top", status: undefined }));
    const status = await useWait(() => queryGetDiscussion(discussionId))();
    setDiscussionProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const createArgument = async () => {
    // If user is trying to create argument while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (state.argument.text.length === 0) return;
    if (state.argument.text.length > 500) return;
    if (!discussion) return;
    if (actionArgumentProps.loader) return;

    setActionArgumentProps(s => ({ ...s, loader: "top", status: undefined }));
    const status = await useWait(() => queryCreateArgument(discussion.id, state.argument.text, state.argument.type))();
    setActionArgumentProps(s => ({ ...s, loader: undefined, status: status }));

    // Since it's a controlled component, it's value can't be changed
    // directly with a setState call, instead it's html property must be changed
    if (argumentInputRef.current) argumentInputRef.current.value = "";
    setState(s => ({ ...s, argument: { ...s.argument, text: "" } }));
  }

  const createComment = async () => {
    // If user is trying to create comment while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (state.comment.text.length === 0) return;
    if (state.comment.text.length > 500) return;
    if (!discussion) return;
    if (actionCommentProps.loader) return;

    setActionCommentProps(s => ({ ...s, loader: "top", status: undefined }));
    const status = await useWait(() => queryCreateComment(discussion.id, state.comment.text))();
    setActionCommentProps(s => ({ ...s, loader: undefined, status: status }));

    // Since it's a controlled component, it's value can't be changed
    // directly with a setState call, instead it's html property must be changed
    if (commentInputRef.current) commentInputRef.current.value = "";
    setState(s => ({ ...s, comment: { ...s.comment, text: "" } }));
  }

  const getArguments = async (type: "newer" | "older" | "top" | "bottom", refresh?: boolean) => {
    if (!discussion) return;
    if (fetchArgumentProps.loader) return;

    setFetchArgumentProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));
    const status = await useWait(() => queryGetArguments(discussion.id, type, refresh))();
    if (refresh) useDiscussionStore.setState(state => { discussionId && delete state.discussion.arguments[discussionId] });
    setFetchArgumentProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const getComments = async (type: "newer" | "older", refresh?: boolean) => {
    if (!discussion) return;
    if (fetchCommentProps.loader) return;

    setFetchCommentProps(s => ({
      ...s, loader: refresh ? "top" : "bottom", status: undefined
    }));
    const status = await useWait(() => queryGetComments(discussion.id, type, refresh))();
    if (refresh) useDiscussionStore.setState(state => { discussionId && delete state.discussion.comments[discussionId] });
    setFetchCommentProps(s => ({ ...s, loader: undefined, status: status }));
  }

  const fetcher = async (show: typeof state.show, refresh?: boolean) => {
    switch (show) {
      case "arguments": await getArguments(state.argumentType, refresh); break;
      case "comments": await getComments(state.commentType, refresh); break;
    }
  }

  const changeShow = (value: string) => {
    if (value === "arguments" || value === "comments") {
      setState(s => ({ ...s, show: value }));
    }
  }

  const changeType = (value: string) => {
    if (state.show === "arguments") {
      if (
        value !== "newer" &&
        value !== "older" &&
        value !== "top" &&
        value !== "bottom"
      ) return;
      setState(s => ({ ...s, argumentType: value }));
      useDiscussionStore.setState(state => { discussionId && delete state.discussion.arguments[discussionId] });
    }
    else if (state.show === "comments") {
      if (
        value !== "newer" &&
        value !== "older"
      ) return;
      setState(s => ({ ...s, commentType: value }));
      useDiscussionStore.setState(state => { discussionId && delete state.discussion.comments[discussionId] });
    }
  }

  const getActionLoader = (show: typeof state.show) => {
    switch (show) {
      case "arguments": return actionArgumentProps.loader;
      case "comments": return actionCommentProps.loader;
    }
  }

  const getFetchLoader = (show: typeof state.show) => {
    switch (show) {
      case "arguments": return fetchArgumentProps.loader;
      case "comments": return fetchCommentProps.loader;
    }
  }

  const getFeed = (show: typeof state.show) => {
    switch (show) {
      case "arguments": return _arguments;
      case "comments": return comments;
    }
  }

  useEffect(() => {
    getFeed(state.show).length === 0 && fetcher(state.show, false);
  }, [state.show, state.argumentType, state.commentType]);

  useEffect(() => { getDiscussion() }, []);

  if (!discussion || discussionProps.loader) {
    return (
      <>
        {discussionProps.loader && <CardLoader />}
        {!discussionProps.loader && discussionProps.status === false &&
          <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
        }
      </>
    )
  }

  return (
    <>
      <DiscussionSummary discussionId={discussionId} />

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder css={wrapContent}>
        <TextParser text={discussion.readme ?? ""} />
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
        </Flex>
      </Card>

      <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
        {getActionLoader(state.show) && <OverlayLoader />}

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
        onBottom={() => fetcher(state.show, false)}
        loader={getFetchLoader(state.show)}
      >
        {state.show === "arguments" && _arguments.map((argument) => <Argument key={argument.id} argumentId={argument.id} />)}
        {state.show === "comments" && comments.map((comment) => <Comment key={comment.id} commentId={comment.id} />)}
      </InfiniteScroll>
    </>
  )
}

export default Discussion