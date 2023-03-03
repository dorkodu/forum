import { IArgument } from "@api/types/argument";
import { IComment } from "@api/types/comment";
import { Button, Card, Flex, SegmentedControl, Textarea } from "@mantine/core";
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { wrapContent } from "../styles/css";
import Argument from "./Argument";
import CardAlert from "./cards/CardAlert";
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

function Discussion({ discussionId }: Props) {
  const [argument, setArgument] = useState<{ text: string, type: boolean }>({ text: "", type: true });
  const [comment, setComment] = useState<{ text: string }>({ text: "" });

  const { t } = useTranslation();

  const state = useAppStore(state => state.options.discussion);
  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const currentUserId = useAuthStore(state => state.userId);

  const queryGetArguments = useDiscussionStore(state => state.queryGetArguments);
  const queryGetComments = useDiscussionStore(state => state.queryGetComments);
  const queryCreateArgument = useDiscussionStore(state => state.queryCreateArgument);
  const queryCreateComment = useDiscussionStore(state => state.queryCreateComment);

  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const comments = useDiscussionStore(_state => _state.getComments(discussionId, state.commentType));
  const _arguments = useDiscussionStore(_state => _state.getArguments(discussionId, state.argumentType));

  const argumentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const [discussionProps, setDiscussionProps] = useFeedProps({ loading: true });

  const [fetchArgumentProps, setFetchArgumentProps] = useFeedProps();
  const [fetchCommentProps, setFetchCommentProps] = useFeedProps();

  const [actionArgumentProps, setActionArgumentProps] = useFeedProps();
  const [actionCommentProps, setActionCommentProps] = useFeedProps();

  const getDiscussion = async () => {
    if (!discussionId) return;

    setDiscussionProps(s => ({ ...s, loading: true, status: undefined }));

    const res = await sage.get(
      {
        a: sage.query("getDiscussion", { discussionId }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
        c: (state.show === "arguments" ?
          sage.query("getArguments", { discussionId, anchorId: "-1", type: state.argumentType }, { ctx: "c" }) :
          sage.query("getComments", { discussionId, anchorId: "-1", type: state.commentType }, { ctx: "c" })
        ),
        d: sage.query("getUser", {}, { ctx: "c", wait: "c" }),
      },
      (query) => request(query)
    )

    const status =
      !(!res?.a.data || res.a.error) &&
      !(!res?.b.data || res.b.error) &&
      !(!res?.c.data || res.c.error) &&
      !(!res?.d.data || res.d.error)

    const discussion = res?.a.data;
    const user = res?.b.data;
    const argumentsOrComments = res?.c.data;
    const users = res?.d.data;

    // Clear arguments/comments data to only show refreshed data
    useDiscussionStore.setState(s => {
      if (!discussionId) return;
      delete s.discussion.arguments[discussionId];
      delete s.discussion.comments[discussionId];
    })

    if (discussion) useDiscussionStore.setState(s => { s.discussion.entities[discussion.id] = discussion });
    if (user) useUserStore.getState().setUsers(user);
    if (argumentsOrComments) {
      if (state.show === "arguments") {
        const _arguments = argumentsOrComments as IArgument[];
        useDiscussionStore.getState().setArguments(discussionId, _arguments, state.argumentType);
      }
      else if (state.show === "comments") {
        const comments = argumentsOrComments as IComment[];
        useDiscussionStore.getState().setComments(discussionId, comments);
      }
    }
    if (users) useUserStore.getState().setUsers(users);

    setDiscussionProps(s => ({ ...s, loading: false, status: status }));
    setFetchArgumentProps(s => ({ ...s, hasMore: true }));
    setFetchCommentProps(s => ({ ...s, hasMore: true }));
  }

  const createArgument = async () => {
    // If user is trying to create argument while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (argument.text.length === 0) return;
    if (argument.text.length > 500) return;
    if (!discussion) return;
    if (actionArgumentProps.loading) return;

    setActionArgumentProps(s => ({ ...s, loading: true, status: undefined }));
    const status = await useWait(() => queryCreateArgument(discussion.id, argument.text, argument.type))();
    setActionArgumentProps(s => ({ ...s, loading: false, status: status }));

    // TODO: If status is not true (failed), don't reset input, instead show error message

    // Since it's a controlled component, it's value can't be changed
    // directly with a setArgument call, instead it's html property must be changed
    if (argumentInputRef.current) argumentInputRef.current.value = "";
    setArgument(a => ({ ...a, text: "" }));
  }

  const createComment = async () => {
    // If user is trying to create comment while not being logged in
    if (!currentUserId) return setRequestLogin(true);

    if (comment.text.length === 0) return;
    if (comment.text.length > 500) return;
    if (!discussion) return;
    if (actionCommentProps.loading) return;

    setActionCommentProps(s => ({ ...s, loading: true, status: undefined }));
    const status = await useWait(() => queryCreateComment(discussion.id, comment.text))();
    setActionCommentProps(s => ({ ...s, loading: false, status: status }));

    // TODO: If status is not true (failed), don't reset input, instead show error message

    // Since it's a controlled component, it's value can't be changed
    // directly with a setComment call, instead it's html property must be changed
    if (commentInputRef.current) commentInputRef.current.value = "";
    setComment(a => ({ ...a, text: "" }));
  }

  const getArguments = async (type: "newer" | "older" | "top" | "bottom", refresh?: boolean, skipWaiting?: boolean) => {
    if (!discussion) return;
    if (!skipWaiting && fetchArgumentProps.loading) return;

    setFetchArgumentProps(s => ({ ...s, loading: true, status: undefined }));
    const res = await useWait(() => queryGetArguments(discussion.id, type, refresh))();
    setFetchArgumentProps(s => ({ ...s, loading: false, status: res.status, hasMore: res.length !== 0 }));
  }

  const getComments = async (type: "newer" | "older", refresh?: boolean, skipWaiting?: boolean) => {
    if (!discussion) return;
    if (!skipWaiting && fetchCommentProps.loading) return;

    setFetchCommentProps(s => ({ ...s, loading: true, status: undefined }));
    const res = await useWait(() => queryGetComments(discussion.id, type, refresh))();
    setFetchCommentProps(s => ({ ...s, loading: false, status: res.status, hasMore: res.length !== 0 }));
  }

  const fetcher = async (show: typeof state.show, refresh?: boolean, skipWaiting?: boolean) => {
    switch (show) {
      case "arguments": await getArguments(state.argumentType, refresh, skipWaiting); break;
      case "comments": await getComments(state.commentType, refresh, skipWaiting); break;
    }
  }

  const changeShow = (value: string) => {
    if (value === "arguments" || value === "comments") {
      useAppStore.setState(s => { s.options.discussion.show = value });
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
      useAppStore.setState(s => { s.options.discussion.argumentType = value });
      useDiscussionStore.setState(state => { discussionId && delete state.discussion.arguments[discussionId] });
    }
    else if (state.show === "comments") {
      if (
        value !== "newer" &&
        value !== "older"
      ) return;
      useAppStore.setState(s => { s.options.discussion.commentType = value });
      useDiscussionStore.setState(state => { discussionId && delete state.discussion.comments[discussionId] });
    }
  }

  const getActionLoading = (show: typeof state.show) => {
    switch (show) {
      case "arguments": return actionArgumentProps.loading;
      case "comments": return actionCommentProps.loading;
    }
  }

  const getFeed = (show: typeof state.show) => {
    switch (show) {
      case "arguments": return _arguments;
      case "comments": return comments;
    }
  }

  const getHasMore = (feed: typeof state.show) => {
    switch (feed) {
      case "arguments": return fetchArgumentProps.hasMore;
      case "comments": return fetchCommentProps.hasMore;
    }
  }

  useEffect(() => {
    getFeed(state.show).length === 0 && fetcher(state.show, false);
  }, [state.show, state.argumentType, state.commentType]);

  useEffect(() => { getDiscussion() }, []);

  return (
    <InfiniteScroll
      refresh={getDiscussion}
      next={() => fetcher(state.show, false, true)}
      length={getFeed(state.show).length}
      hasMore={getHasMore(state.show)}
      hideLoader={!discussion}
    >
      {!discussion || discussionProps.loading ?
        <>
          {!discussionProps.loading && discussionProps.status === false &&
            <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
          }
        </>

        :

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
            {getActionLoading(state.show) && <OverlayLoader />}

            {state.show === "arguments" &&
              <>
                <Textarea
                  radius="md"
                  label={`${t("argument.title")} (${argument.text.length} / 500)`}
                  description={t("argument.description")}
                  placeholder={t("argument.write")}
                  ref={argumentInputRef}
                  defaultValue={argument.text}
                  onChange={ev => setArgument(s => ({ ...s, text: ev.target.value }))}
                  autosize
                  pb="md"
                />

                <Button onClick={createArgument} color="dark" radius="md" mr="md">{t("argument.create")}</Button>

                <SegmentedControl radius="md"
                  value={argument.type ? "+" : "-"}
                  onChange={(type: "+" | "-") => setArgument(s => ({ ...s, type: type === "+" }))}
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
                  label={`${t("comment.title")} (${comment.text.length} / 500)`}
                  description={t("comment.description")}
                  placeholder={t("comment.write")}
                  ref={commentInputRef}
                  defaultValue={comment.text}
                  onChange={ev => setComment(s => ({ ...s, text: ev.target.value }))}
                  autosize
                  pb="md"
                />

                <Button onClick={createComment} color="dark" radius="md" mr="md">{t("comment.create")}</Button>
              </>
            }
          </Card>

          {state.show === "arguments" && _arguments.map((argument) => <Argument key={argument.id} argumentId={argument.id} />)}
          {state.show === "comments" && comments.map((comment) => <Comment key={comment.id} commentId={comment.id} />)}
        </>
      }
    </InfiniteScroll>
  )
}

export default Discussion