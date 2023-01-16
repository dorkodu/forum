import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { request, sage } from "./api";
import type { IDiscussion } from "@api/types/discussion";
import type { IArgument } from "@api/types/argument";
import type { IComment } from "@api/types/comment";

interface State {
  discussion: {
    entities: { [key: string]: IDiscussion }
  }

  argument: {
    entities: { [key: string]: IArgument }
  }

  comment: {
    entities: { [key: string]: IComment }
  }
}

interface Action {
  queryCreateDiscussion: (title: string, readme: string) => Promise<boolean>;
  queryDeleteDiscussion: () => Promise<boolean>;
  queryEditDiscussion: () => Promise<boolean>;
  querySearchDiscussion: () => Promise<boolean>;

  queryFavouriteDiscussion: () => Promise<boolean>;

  queryGetUserDiscussionFeed: () => Promise<boolean>;
  queryGetGuestDiscussionFeed: () => Promise<boolean>;

  queryCreateArgument: () => Promise<boolean>;
  queryDeleteArgument: () => Promise<boolean>;
  queryGetArguments: () => Promise<boolean>;
  queryVoteArgument: () => Promise<boolean>;

  queryCreateComment: () => Promise<boolean>;
  queryDeleteComment: () => Promise<boolean>;
  queryGetComments: () => Promise<boolean>;
}

const initialState: State = {
  discussion: { entities: {} },
  argument: { entities: {} },
  comment: { entities: {} },
}

export const useDiscussionStore = create(immer<State & Action>((set, _get) => ({
  ...initialState,

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

  queryCreateArgument: async () => {
    return false;
  },

  queryDeleteArgument: async () => {
    return false;
  },

  queryGetArguments: async () => {
    return false;
  },

  queryVoteArgument: async () => {
    return false;
  },

  queryCreateComment: async () => {
    return false;
  },

  queryDeleteComment: async () => {
    return false;
  },

  queryGetComments: async () => {
    return false;
  },
})))