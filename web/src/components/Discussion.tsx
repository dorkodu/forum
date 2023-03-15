import { IArgument } from "@api/types/argument";
import { IComment } from "@api/types/comment";
import { Card, Divider, Flex } from "@mantine/core";
import { useEffect } from "react"
import { useTranslation } from "react-i18next";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { useUserStore } from "../stores/userStore";
import { wrapContent } from "../styles/css";
import Argument from "./Argument";
import CardAlert from "./cards/CardAlert";
import CardLoader from "./cards/CardLoader";
import { CardPanel } from "./cards/CardPanel";
import Comment from "./Comment"
import CreateArgument from "./CreateArgument";
import CreateComment from "./CreateComment";
import DiscussionSummary from "./DiscussionSummary";
import { useFeedProps, useWait } from "./hooks";
import InfiniteScroll from "./InfiniteScroll";
import TextParser from "./TextParser";

interface Props {
  discussionId: string | undefined;

  // Highlights particular argument/comment. Mainly used by notifications.
  argumentId?: string;
  commentId?: string;
}

function Discussion({ discussionId, argumentId, commentId }: Props) {
  const { t } = useTranslation();

  const state = useAppStore(
    state => state.options.discussion,
    (a, b) => a.argument !== b.argument || a.comment !== b.comment
  );

  const queryGetArguments = useDiscussionStore(state => state.queryGetArguments);
  const queryGetComments = useDiscussionStore(state => state.queryGetComments);

  const discussion = useDiscussionStore(state => state.getDiscussionById(discussionId));
  const comments = useDiscussionStore(_state => _state.getComments(discussionId, state.commentOrder));
  const _arguments = useDiscussionStore(_state => _state.getArguments(discussionId, state.argumentOrder));
  const discussionArgument = useDiscussionStore(state => argumentId ? state.argument.entities[argumentId] : undefined);
  const discussionComment = useDiscussionStore(state => commentId ? state.comment.entities[commentId] : undefined);

  const [discussionProps, setDiscussionProps] = useFeedProps({ loading: !discussion?.readme });

  const [fetchArgumentProps, setFetchArgumentProps] = useFeedProps();
  const [fetchCommentProps, setFetchCommentProps] = useFeedProps();

  const getDiscussion = async () => {
    if (!discussionId) return;

    setDiscussionProps(s => ({ ...s, loading: true, status: undefined }));

    const res = await sage.get(
      {
        a: sage.query("getDiscussion", { discussionId }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
        c: (state.show === "arguments" ?
          sage.query("getArguments", { discussionId, anchorId: "-1", type: state.argumentOrder }, { ctx: "c" }) :
          sage.query("getComments", { discussionId, anchorId: "-1", type: state.commentOrder }, { ctx: "c" })
        ),
        d: sage.query("getUser", {}, { ctx: "c", wait: "c" }),
      },
      (query) => useWait(() => request(query))()
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
        useDiscussionStore.getState().setArguments(discussionId, _arguments, state.argumentOrder);
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

  const getDiscussionArgument = async () => {
    if (!argumentId) return;

    const res = await sage.get(
      {
        a: sage.query("getArgument", { argumentId }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    );

    //const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const argument = res?.a.data;
    const user = res?.b.data?.[0];

    useDiscussionStore.setState(s => {
      if (!argument) return;
      s.argument.entities[argumentId] = argument;
    });

    useUserStore.setState(s => {
      if (!user) return;
      s.user.entities[user.id] = user;
    });
  }

  const getDiscussionComment = async () => {
    if (!commentId) return;

    const res = await sage.get(
      {
        a: sage.query("getComment", { commentId }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => useWait(() => request(query))()
    );

    //const status = !(!res?.a.data || res.a.error) && !(!res?.b.data || res.b.error);
    const comment = res?.a.data;
    const user = res?.b.data?.[0];

    useDiscussionStore.setState(s => {
      if (!comment) return;
      s.comment.entities[commentId] = comment;
    });

    useUserStore.setState(s => {
      if (!user) return;
      s.user.entities[user.id] = user;
    });
  }

  const fetcher = async (show: typeof state.show, refresh?: boolean, skipWaiting?: boolean) => {
    switch (show) {
      case "arguments": await getArguments(state.argumentOrder, refresh, skipWaiting); break;
      case "comments": await getComments(state.commentOrder, refresh, skipWaiting); break;
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
      useAppStore.setState(s => { s.options.discussion.argumentOrder = value });
      useDiscussionStore.setState(state => { discussionId && delete state.discussion.arguments[discussionId] });
    }
    else if (state.show === "comments") {
      if (
        value !== "newer" &&
        value !== "older"
      ) return;
      useAppStore.setState(s => { s.options.discussion.commentOrder = value });
      useDiscussionStore.setState(state => { discussionId && delete state.discussion.comments[discussionId] });
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
    if (!discussion?.readme) getDiscussion();
    else getFeed(state.show).length === 0 && fetcher(state.show, false);

    if (argumentId && !discussionArgument) getDiscussionArgument();
    else if (commentId && !discussionComment) getDiscussionComment();
  }, [state.show, state.argumentOrder, state.commentOrder]);

  return (
    <InfiniteScroll
      refresh={getDiscussion}
      next={() => fetcher(state.show, false, true)}
      hasMore={getHasMore(state.show)}
    >
      {!discussion ?
        <>
          {discussionProps.status === false &&
            <CardAlert title={t("error.text")} content={t("error.default")} type="error" />
          }
        </>

        :

        <>
          <DiscussionSummary discussionId={discussionId} />

          {(argumentId || commentId) &&
            <>
              <Flex justify="center">
                <Divider orientation="vertical" variant="dashed" h={64} size="md" />
              </Flex>
              {argumentId && <Argument argumentId={argumentId} />}
              {commentId && <Comment commentId={commentId} />}
            </>
          }

          {discussion.readme ?
            <Card shadow="sm" p="md" m="md" radius="md" withBorder css={wrapContent}>
              <TextParser text={discussion.readme} />
            </Card>
            :
            <CardLoader />
          }

          <Card shadow="sm" p="md" m="md" radius="md" withBorder>
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
                      value: state.argumentOrder,
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
                      value: state.commentOrder,
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

          {state.show === "arguments" && <CreateArgument discussionId={discussion.id} />}
          {state.show === "comments" && <CreateComment discussionId={discussion.id} />}

          {state.show === "arguments" && _arguments.map((argument) => <Argument key={argument.id} argumentId={argument.id} />)}
          {state.show === "comments" && comments.map((comment) => <Comment key={comment.id} commentId={comment.id} />)}
        </>
      }
    </InfiniteScroll>
  )
}

export default Discussion