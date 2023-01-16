import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'

interface State {

}

interface Action {
  queryCreateDiscussion: () => Promise<boolean>;
  queryDeleteDiscussion: () => Promise<boolean>;
  queryEditDiscussion: () => Promise<boolean>;
  querySearchDiscussion: () => Promise<boolean>;

  queryFavouriteDiscussion: () => Promise<boolean>;

  queryGetUserDiscussionFeed: () => Promise<boolean>;
  queryGetGuestDiscussionFeed: () => Promise<boolean>;

  queryCreateComment: () => Promise<boolean>;
  queryDeleteComment: () => Promise<boolean>;
  queryGetComments: () => Promise<boolean>;

  queryCreateArgument: () => Promise<boolean>;
  queryDeleteArgument: () => Promise<boolean>;
  queryGetArguments: () => Promise<boolean>;
  queryVoteArgument: () => Promise<boolean>;
}

const initialState: State = {

}

export const useDiscussionStore = create(immer<State & Action>((_set, _get) => ({
  ...initialState,

  queryCreateDiscussion: async () => {
    return false;
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

  queryCreateComment: async () => {
    return false;
  },

  queryDeleteComment: async () => {
    return false;
  },

  queryGetComments: async () => {
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
})))