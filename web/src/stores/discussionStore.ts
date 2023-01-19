import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { request, sage } from "./api";
import type { IDiscussion } from "@api/types/discussion";
import type { IArgument } from "@api/types/argument";
import type { IComment } from "@api/types/comment";
import { useUserStore } from "./userStore";
import { array } from "../lib/array";

interface State {
  discussion: {
    entities: { [key: string]: IDiscussion }

    // arguments[discussionId].normal[argumentId] -> IArgument
    arguments: {
      [key: string]: {
        normal: { [key: string]: IArgument },
        top: IArgument[],     // arguments with highest vote count
        bottom: IArgument[],  // arguments with lowest vote count
      }
    }

    // comments[discussionId][commentId] -> IComment
    comments: { [key: string]: { [key: string]: IComment } }
  }

  argument: {
    entities: { [key: string]: IArgument }
  }

  comment: {
    entities: { [key: string]: IComment }
  }
}

interface Action {
  getDiscussionById: (discussionId: string | undefined) => IDiscussion | undefined;

  getArgument: (argumentId: string | undefined) => IArgument | undefined;
  getArguments: (discussionId: string | undefined, type: "newer" | "older" | "top" | "bottom") => IArgument[];
  setArguments: (discussionId: string, argumentsArray: IArgument[], type: "newer" | "older" | "top" | "bottom") => void;
  getArgumentAnchor: (discussionId: string, type: "newer" | "older", refresh?: boolean) => string;

  getComment: (commentId: string | undefined) => IComment | undefined;
  getComments: (discussionId: string | undefined, type: "newer" | "older") => IComment[];
  setComments: (discussionId: string, comments: IComment[]) => void;
  getCommentAnchor: (discussionId: string, type: "newer" | "older", refresh?: boolean) => string;

  queryCreateDiscussion: (title: string, readme: string) => Promise<boolean>;
  queryDeleteDiscussion: () => Promise<boolean>;
  queryGetDiscussion: (discussionId: string | undefined) => Promise<boolean>;
  queryEditDiscussion: () => Promise<boolean>;
  querySearchDiscussion: () => Promise<boolean>;

  queryFavouriteDiscussion: () => Promise<boolean>;

  queryGetUserDiscussionFeed: () => Promise<boolean>;
  queryGetGuestDiscussionFeed: () => Promise<boolean>;

  queryCreateArgument: (discussionId: string, content: string, type: boolean) => Promise<boolean>;
  queryDeleteArgument: () => Promise<boolean>;
  queryGetArguments: (
    discussionId: string,
    type: "newer" | "older" | "top" | "bottom",
    refresh?: boolean
  ) => Promise<boolean>;
  queryVoteArgument: () => Promise<boolean>;

  queryCreateComment: (discussionId: string, content: string) => Promise<boolean>;
  queryDeleteComment: () => Promise<boolean>;
  queryGetComments: (discussionId: string, type: "newer" | "older", refresh?: boolean) => Promise<boolean>;
}

const initialState: State = {
  discussion: { entities: {}, arguments: {}, comments: {} },
  argument: { entities: {} },
  comment: { entities: {} },
}

export const useDiscussionStore = create(immer<State & Action>((set, get) => ({
  ...initialState,

  getDiscussionById: (discussionId) => {
    if (!discussionId) return undefined;
    return get().discussion.entities[discussionId];
  },


  getArgument: (argumentId) => {
    if (!argumentId) return undefined;
    return get().argument.entities[argumentId];
  },

  getArguments: (discussionId, type) => {
    if (!discussionId) return [];

    if (type === "top") return get().discussion.arguments[discussionId]?.top ?? [];
    else if (type === "bottom") return get().discussion.arguments[discussionId]?.bottom ?? [];

    const object = get().discussion.arguments[discussionId]?.normal;
    if (!object) return [];

    const arr: IArgument[] = Object.values(object)
    const sorted = array.sort(arr, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b))
    return sorted;
  },

  setArguments: (discussionId, argumentsArray, type) => {
    set(state => {
      if (!state.discussion.arguments[discussionId])
        state.discussion.arguments[discussionId] = { normal: {}, top: [], bottom: [] };

      if (type === "top") state.discussion.arguments[discussionId]!.top = argumentsArray;
      else if (type === "bottom") state.discussion.arguments[discussionId]!.bottom = argumentsArray;
      else {
        argumentsArray.forEach((argument) => {
          state.discussion.arguments[discussionId]!.normal[argument.id] = argument;
          state.argument.entities[argument.id] = argument;
        })
      }
    })
  },

  getArgumentAnchor: (discussionId, type, refresh) => {
    const argumentsArray = get().discussion.arguments[discussionId]?.normal;
    let anchorId = "-1";
    if (argumentsArray) anchorId = array.getAnchor(Object.values(argumentsArray), "id", "-1", type, refresh);
    return anchorId;
  },


  getComment: (commentId) => {
    if (!commentId) return undefined;
    return get().comment.entities[commentId];
  },

  getComments: (discussionId, type) => {
    if (!discussionId) return [];

    const object = get().discussion.comments[discussionId];
    if (!object) return [];

    const arr: IComment[] = Object.values(object)
    const sorted = array.sort(arr, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b))
    return sorted;
  },

  setComments: (discussionId, comments) => {
    set(state => {
      if (!state.discussion.comments[discussionId])
        state.discussion.comments[discussionId] = {};

      comments.forEach((comment) => {
        state.discussion.comments[discussionId]![comment.id] = comment;
        state.comment.entities[comment.id] = comment;
      })
    })
  },

  getCommentAnchor: (discussionId, type, refresh) => {
    const comments = get().discussion.comments[discussionId];
    let anchorId = "-1";
    if (comments) anchorId = array.getAnchor(Object.values(comments), "id", "-1", type, refresh);
    return anchorId;
  },


  queryCreateDiscussion: async (title, readme) => {
    const res = await sage.get(
      { a: sage.query("createDiscussion", { title, readme }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const discussion = res?.a.data;

    set(state => {
      if (!discussion) return;
      state.discussion.entities[discussion.id] = discussion;
    })

    return status;
  },

  queryDeleteDiscussion: async () => {
    return false;
  },

  queryEditDiscussion: async () => {
    return false;
  },

  queryGetDiscussion: async (discussionId) => {
    if (!discussionId) return false;

    const res = await sage.get(
      {
        a: sage.query("getDiscussion", { discussionId }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
        c: sage.query("getComments", { discussionId, anchorId: "-1", type: "newer" }, { ctx: "c" }),
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
    const users = res?.b.data;
    const comments = res?.c.data;
    const commentUsers = res?.d.data;

    if (comments) get().setComments(discussionId, comments);

    set(state => {
      if (discussion) state.discussion.entities[discussion.id] = discussion;
    })

    useUserStore.setState((store) => {
      if (users) users.forEach((user) => { store.user.entities[user.id] = user; })
      if (commentUsers) commentUsers.forEach((commentUser) => { store.user.entities[commentUser.id] = commentUser; })
    })

    return status;
  },

  querySearchDiscussion: async () => {
    return false;
  },

  queryFavouriteDiscussion: async () => {
    return false;
  },

  queryGetUserDiscussionFeed: async () => {
    return false;
  },

  queryGetGuestDiscussionFeed: async () => {
    return false;
  },

  queryCreateArgument: async (discussionId, content, type) => {
    const res = await sage.get(
      { a: sage.query("createArgument", { discussionId, content, type }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const argument = res?.a.data;

    set(state => {
      if (!argument) return;
      state.argument.entities[argument.id] = argument;
    })

    return status;
  },

  queryDeleteArgument: async () => {
    return false;
  },

  queryGetArguments: async (discussionId, type, refresh) => {
    let anchorId = "-1";
    if (type !== "top" && type !== "bottom")
      anchorId = get().getArgumentAnchor(discussionId, type, refresh);

    const res = await sage.get(
      { a: sage.query("getArguments", { discussionId, anchorId, type }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const argumentsArray = res?.a.data;

    if (argumentsArray) get().setArguments(discussionId, argumentsArray, type);
    return status;
  },

  queryVoteArgument: async () => {
    return false;
  },

  queryCreateComment: async (discussionId, content) => {
    const res = await sage.get(
      { a: sage.query("createComment", { discussionId, content }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const comment = res?.a.data;

    if (comment) get().setComments(discussionId, [comment]);

    return status;
  },

  queryDeleteComment: async () => {
    return false;
  },

  queryGetComments: async (discussionId, type, refresh) => {
    const anchorId = get().getCommentAnchor(discussionId, type, refresh);

    const res = await sage.get(
      { a: sage.query("getComments", { discussionId, anchorId, type }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const comments = res?.a.data;

    if (comments) get().setComments(discussionId, comments);
    return status;
  },
})))