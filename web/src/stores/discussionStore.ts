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

    // users[userId][discussionId] -> boolean
    users: { [key: string]: { [key: string]: boolean } }

    arguments: {
      [key: string]: {
        normal: { [key: string]: boolean },
        top: IArgument[],     // arguments with highest vote count
        bottom: IArgument[],  // arguments with lowest vote count
      }
    }

    // comments[discussionId][commentId] -> IComment
    comments: { [key: string]: { [key: string]: boolean } }
  }

  argument: {
    entities: { [key: string]: IArgument }
  }

  comment: {
    entities: { [key: string]: IComment }
  }

  userFeed: { [key: string]: boolean }
  favouriteFeed: { [key: string]: boolean }
  guestFeed: { [key: string]: boolean }
}

interface Action {
  getDiscussionById: (discussionId: string | undefined) => IDiscussion | undefined;
  deleteDiscussion: (discussion: IDiscussion) => void;

  getUserDiscussions: (userId: string | undefined, type: "newer" | "older") => IDiscussion[];
  setUserDiscussions: (userId: string, discussions: IDiscussion[]) => void;
  getUserDiscussionAnchor: (userId: string, type: "newer" | "older", refresh?: boolean) => string;

  getUserFeedDiscussions: (type: "newer" | "older") => IDiscussion[];
  addUserFeedDiscussions: (discussions: IDiscussion[]) => void;
  removeUserFeedDiscussions: (discussions: IDiscussion[]) => void;
  getUserFeedAnchor: (type: "newer" | "older", refresh?: boolean) => string;

  getFavouriteFeedDiscussions: (type: "newer" | "older") => IDiscussion[];
  addFavouriteFeedDiscussions: (discussions: IDiscussion[]) => void;
  removeFavouriteFeedDiscussions: (discussions: IDiscussion[]) => void;
  getFavouriteFeedAnchor: (type: "newer" | "older", refresh?: boolean) => string;

  getGuestFeedDiscussions: (type: "newer" | "older") => IDiscussion[];
  addGuestFeedDiscussions: (discussions: IDiscussion[]) => void;
  getGuestFeedAnchor: (type: "newer" | "older", refresh?: boolean) => string;

  deleteArgument: (argument: IArgument | undefined) => void;
  getArgument: (argumentId: string | undefined) => IArgument | undefined;
  getArguments: (discussionId: string | undefined, type: "newer" | "older" | "top" | "bottom") => IArgument[];
  setArguments: (discussionId: string, argumentsArray: IArgument[], type: "newer" | "older" | "top" | "bottom") => void;
  getArgumentAnchor: (discussionId: string, type: "newer" | "older", refresh?: boolean) => string;

  deleteComment: (comment: IComment | undefined) => void;
  getComment: (commentId: string | undefined) => IComment | undefined;
  getComments: (discussionId: string | undefined, type: "newer" | "older") => IComment[];
  setComments: (discussionId: string, comments: IComment[]) => void;
  getCommentAnchor: (discussionId: string, type: "newer" | "older", refresh?: boolean) => string;

  queryCreateDiscussion: (title: string, readme: string) => Promise<boolean>;
  queryDeleteDiscussion: (discussion: IDiscussion) => Promise<boolean>;
  queryGetDiscussion: (discussionId: string | undefined) => Promise<boolean>;
  queryEditDiscussion: (discussionId: string, title: string, readme: string) => Promise<boolean>;
  querySearchDiscussion: () => Promise<boolean>;

  queryFavouriteDiscussion: (discussion: IDiscussion) => Promise<boolean>;

  queryGetUserDiscussionFeed: () => Promise<boolean>;
  queryGetFavouriteDiscussionFeed: () => Promise<boolean>;
  queryGetGuestDiscussionFeed: () => Promise<boolean>;

  queryCreateArgument: (discussionId: string, content: string, type: boolean) => Promise<boolean>;
  queryDeleteArgument: (argument: IArgument) => Promise<boolean>;
  queryGetArguments: (
    discussionId: string,
    type: "newer" | "older" | "top" | "bottom",
    refresh?: boolean
  ) => Promise<boolean>;
  queryVoteArgument: (argument: IArgument, type: boolean) => Promise<boolean>;

  queryCreateComment: (discussionId: string, content: string) => Promise<boolean>;
  queryDeleteComment: (comment: IComment) => Promise<boolean>;
  queryGetComments: (discussionId: string, type: "newer" | "older", refresh?: boolean) => Promise<boolean>;

  reset: () => void;
}

const initialState: State = {
  discussion: { entities: {}, users: {}, arguments: {}, comments: {} },
  argument: { entities: {} },
  comment: { entities: {} },
  userFeed: {},
  favouriteFeed: {},
  guestFeed: {},
}

export const useDiscussionStore = create(immer<State & Action>((set, get) => ({
  ...initialState,

  getDiscussionById: (discussionId) => {
    if (!discussionId) return undefined;
    return get().discussion.entities[discussionId];
  },

  deleteDiscussion: (discussion) => {
    set(state => {
      delete state.discussion.entities[discussion.id];
      delete state.discussion.arguments[discussion.id];
      delete state.discussion.comments[discussion.id];
      delete state.discussion.users[discussion.userId]?.[discussion.id];
      delete state.favouriteFeed[discussion.id];
      delete state.guestFeed[discussion.id];

      // TODO: Delete arguments/comments from state.(argument/discussion) too.
    })
  },


  getUserDiscussions: (userId, type) => {
    if (!userId) return [];
    const followers = get().discussion.users[userId];
    if (!followers) return [];

    const out: IDiscussion[] = [];
    const keys = Object.keys(followers);
    keys.forEach(key => {
      const user = get().discussion.entities[key];
      if (user) out.push(user);
    })

    return array.sort(out, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  setUserDiscussions: (userId, discussions) => {
    set(state => {
      if (!state.discussion.users[userId])
        state.discussion.users[userId] = {};

      discussions.forEach((discussion) => {
        state.discussion.entities[discussion.id] = discussion;
        state.discussion.users[userId]![discussion.id] = true;
      })
    })
  },

  getUserDiscussionAnchor: (userId, type, refresh) => {
    return array.getAnchor(get().getUserDiscussions(userId, "newer"), "id", "-1", type, refresh);
  },


  getUserFeedDiscussions: (type) => {
    const object = get().userFeed;
    if (!object) return [];

    const out: IDiscussion[] = [];
    const keys = Object.keys(object);
    keys.forEach(key => {
      const discussion = get().discussion.entities[key];
      if (discussion) out.push(discussion);
    })

    return array.sort(out, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  addUserFeedDiscussions: (discussions) => {
    set(state => {
      discussions.forEach(discussion => { state.userFeed[discussion.id] = true })
    })
  },

  removeUserFeedDiscussions: (discussions) => {
    set(state => {
      discussions.forEach(discussion => { delete state.userFeed[discussion.id] })
    })
  },

  getUserFeedAnchor: (type, refresh) => {
    return array.getAnchor(get().getUserFeedDiscussions("newer"), "id", "-1", type, refresh);
  },


  getFavouriteFeedDiscussions: (type) => {
    const object = get().favouriteFeed;
    if (!object) return [];

    const out: IDiscussion[] = [];
    const keys = Object.keys(object);
    keys.forEach(key => {
      const discussion = get().discussion.entities[key];
      if (discussion) out.push(discussion);
    })

    return array.sort(out, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  addFavouriteFeedDiscussions: (discussions) => {
    set(state => {
      discussions.forEach(discussion => { state.favouriteFeed[discussion.id] = true })
    })
  },

  removeFavouriteFeedDiscussions: (discussions) => {
    set(state => {
      discussions.forEach(discussion => { delete state.favouriteFeed[discussion.id] })
    })
  },

  getFavouriteFeedAnchor: (type, refresh) => {
    return array.getAnchor(get().getFavouriteFeedDiscussions("newer"), "id", "-1", type, refresh);
  },


  getGuestFeedDiscussions: (type) => {
    const object = get().guestFeed;
    if (!object) return [];

    const out: IDiscussion[] = [];
    const keys = Object.keys(object);
    keys.forEach(key => {
      const discussion = get().discussion.entities[key];
      if (discussion) out.push(discussion);
    })

    return array.sort(out, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  addGuestFeedDiscussions: (discussions) => {
    set(state => {
      discussions.forEach(discussion => {
        state.discussion.entities[discussion.id] = discussion;
        state.guestFeed[discussion.id] = true;
      })
    })
  },

  getGuestFeedAnchor: (type, refresh) => {
    return array.getAnchor(get().getGuestFeedDiscussions("newer"), "id", "-1", type, refresh);
  },


  deleteArgument: (argument) => {
    if (!argument) return;

    set(state => {
      delete state.argument.entities[argument.id];
      delete state.discussion.arguments[argument.discussionId]?.normal[argument.id];
      let top = state.discussion.arguments[argument.discussionId]?.top;
      let bottom = state.discussion.arguments[argument.discussionId]?.bottom;

      if (top) {
        state.discussion.arguments[argument.discussionId]!.top =
          top?.filter((arg) => arg.id !== argument.id);
      }
      if (bottom) {
        state.discussion.arguments[argument.discussionId]!.bottom =
          bottom?.filter((arg) => arg.id !== argument.id);
      }
    })
  },

  getArgument: (argumentId) => {
    if (!argumentId) return undefined;
    return get().argument.entities[argumentId];
  },

  getArguments: (discussionId, type) => {
    if (!discussionId) return [];

    if (type === "top") {
      const set = get().discussion.arguments[discussionId]?.top;
      return set ?? [];
    }
    else if (type === "bottom") {
      const set = get().discussion.arguments[discussionId]?.bottom;
      return set ?? [];
    }

    const object = get().discussion.arguments[discussionId]?.normal;
    if (!object) return [];

    const out: IArgument[] = [];
    const keys = Object.keys(object);
    keys.forEach(key => {
      const user = get().argument.entities[key];
      if (user) out.push(user);
    })

    return array.sort(out, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  setArguments: (discussionId, argumentsArray, type) => {
    set(state => {
      if (!state.discussion.arguments[discussionId])
        state.discussion.arguments[discussionId] = { normal: {}, top: [], bottom: [] };

      if (type === "top") state.discussion.arguments[discussionId]!.top = argumentsArray;
      else if (type === "bottom") state.discussion.arguments[discussionId]!.bottom = argumentsArray;
      else {
        argumentsArray.forEach((argument) => {
          state.discussion.arguments[discussionId]!.normal[argument.id] = true;
          state.argument.entities[argument.id] = argument;
        })
      }
    })
  },

  getArgumentAnchor: (discussionId, type, refresh) => {
    return array.getAnchor(get().getArguments(discussionId, "newer"), "id", "-1", type, refresh);
  },



  deleteComment: (comment) => {
    if (!comment) return;

    set(state => {
      delete state.comment.entities[comment.id];
      delete state.discussion.comments[comment.discussionId]?.[comment.id];
    })
  },

  getComment: (commentId) => {
    if (!commentId) return undefined;
    return get().comment.entities[commentId];
  },

  getComments: (discussionId, type) => {
    if (!discussionId) return [];

    const object = get().discussion.comments[discussionId];
    if (!object) return [];

    const out: IComment[] = [];
    const keys = Object.keys(object);
    keys.forEach(key => {
      const user = get().comment.entities[key];
      if (user) out.push(user);
    })

    return array.sort(out, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));

  },

  setComments: (discussionId, comments) => {
    set(state => {
      if (!state.discussion.comments[discussionId])
        state.discussion.comments[discussionId] = {};

      comments.forEach((comment) => {
        state.discussion.comments[discussionId]![comment.id] = true;
        state.comment.entities[comment.id] = comment;
      })
    })
  },

  getCommentAnchor: (discussionId, type, refresh) => {
    return array.getAnchor(get().getComments(discussionId, "newer"), "id", "-1", type, refresh);
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

  queryDeleteDiscussion: async (discussion) => {
    const res = await sage.get(
      { a: sage.query("deleteDiscussion", { discussionId: discussion.id }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    if (status) get().deleteDiscussion(discussion);

    return status;
  },

  queryEditDiscussion: async (discussionId, title, readme) => {
    const res = await sage.get(
      { a: sage.query("editDiscussion", { discussionId, title, readme }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);

    set(state => {
      if (!status) return;

      const discussion = state.discussion.entities[discussionId];
      if (!discussion) return;

      discussion.title = title;
      discussion.readme = readme;
      discussion.lastUpdateDate = Date.now();
    })

    return status;
  },

  queryGetDiscussion: async (discussionId) => {
    if (!discussionId) return false;

    const res = await sage.get(
      {
        a: sage.query("getDiscussion", { discussionId }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
        c: sage.query("getArguments", { discussionId, anchorId: "-1", type: "newer" }, { ctx: "c" }),
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
    const _arguments = res?.c.data;
    const argumentUsers = res?.d.data;

    if (_arguments) get().setArguments(discussionId, _arguments, "newer");

    set(state => {
      if (discussion) state.discussion.entities[discussion.id] = discussion;
    })

    useUserStore.setState((store) => {
      if (users) users.forEach((user) => { store.user.entities[user.id] = user; })
      if (argumentUsers) argumentUsers.forEach((argumentUser) => { store.user.entities[argumentUser.id] = argumentUser; })
    })

    return status;
  },

  querySearchDiscussion: async () => {
    return false;
  },

  queryFavouriteDiscussion: async (discussion) => {
    const res = await sage.get(
      { a: sage.query("favouriteDiscussion", { discussionId: discussion.id, favourited: !discussion.favourited }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);

    set(state => {
      const d = state.discussion.entities[discussion.id];
      if (d && status) {
        d.favourited = !d.favourited;
        d.favouriteCount += d.favourited ? +1 : -1;
      }
    })

    const d = get().discussion.entities[discussion.id];
    if (d && d.favourited) get().addFavouriteFeedDiscussions([d]);
    else if (d) get().removeFavouriteFeedDiscussions([d]);

    return status;
  },

  queryGetUserDiscussionFeed: async () => {
    return false;
  },

  queryGetFavouriteDiscussionFeed: async () => {
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

    if (argument) {
      set(state => {
        const discussion = state.discussion.entities[discussionId];
        if (discussion) {
          discussion.argumentCount += +1;
          discussion.lastUpdateDate = Date.now();
        }
      })

      get().setArguments(discussionId, [argument], "newer")
    };

    return status;
  },

  queryDeleteArgument: async (argument) => {
    const res = await sage.get(
      { a: sage.query("deleteArgument", { argumentId: argument.id }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);

    if (status) {
      set(state => {
        const discussion = state.discussion.entities[argument.discussionId];
        if (discussion) discussion.argumentCount += -1;
      })

      get().deleteArgument(argument);
    }

    return status;
  },

  queryGetArguments: async (discussionId, type, refresh) => {
    let anchorId = "-1";
    if (type !== "top" && type !== "bottom")
      anchorId = get().getArgumentAnchor(discussionId, type, refresh);

    const res = await sage.get(
      {
        a: sage.query("getArguments", { discussionId, anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" }),
      },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const argumentsArray = res?.a.data;
    const users = res?.b.data;

    if (argumentsArray) get().setArguments(discussionId, argumentsArray, type);
    useUserStore.setState((store) => {
      if (users) users.forEach((user) => { store.user.entities[user.id] = user; })
    })

    return status;
  },

  queryVoteArgument: async (argument, type) => {
    let voteType: "up" | "down" | "none" = "none";
    if (!argument.voted || argument.votedType !== type) voteType = type ? "up" : "down";

    const res = await sage.get(
      { a: sage.query("voteArgument", { argumentId: argument.id, type: voteType }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);

    set(state => {
      const a = state.argument.entities[argument.id];
      if (a && status) {
        const older = a.voted && a.votedType === true ? -1 : a.voted && a.votedType === false ? +1 : 0;
        const newer = voteType === "up" ? +1 : voteType === "down" ? -1 : 0;
        const total = older + newer;
        a.voteCount += total;
        a.voted = voteType !== "none";
        a.votedType = voteType === "up" ? true : voteType === "down" ? false : null;
      }
    })

    return status;
  },

  queryCreateComment: async (discussionId, content) => {
    const res = await sage.get(
      { a: sage.query("createComment", { discussionId, content }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const comment = res?.a.data;

    if (comment) {
      set(state => {
        const discussion = state.discussion.entities[discussionId];
        if (discussion) {
          discussion.commentCount += +1;
          discussion.lastUpdateDate = Date.now();
        }
      })

      get().setComments(discussionId, [comment]);
    }

    return status;
  },

  queryDeleteComment: async (comment) => {
    const res = await sage.get(
      { a: sage.query("deleteComment", { commentId: comment.id }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    if (status) {
      set(state => {
        const discussion = state.discussion.entities[comment.discussionId];
        if (discussion) discussion.commentCount += -1;
      })

      get().deleteComment(comment);
    }

    return status;
  },

  queryGetComments: async (discussionId, type, refresh) => {
    const anchorId = get().getCommentAnchor(discussionId, type, refresh);

    const res = await sage.get(
      {
        a: sage.query("getComments", { discussionId, anchorId, type }, { ctx: "a" }),
        b: sage.query("getUser", {}, { ctx: "a", wait: "a" })
      },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const comments = res?.a.data;
    const users = res?.b.data;

    if (comments) get().setComments(discussionId, comments);
    useUserStore.setState((store) => {
      if (users) users.forEach((user) => { store.user.entities[user.id] = user; })
    })

    return status;
  },

  reset: () => {
    set(initialState);
  }
})))