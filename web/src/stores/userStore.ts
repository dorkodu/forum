import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'

interface State {

}

interface Action {
  queryGetUser: () => Promise<boolean>;
  queryEditUser: () => Promise<boolean>;
  querySearchUser: () => Promise<boolean>;

  queryGetUserDiscussions: () => Promise<boolean>;

  queryFollowUser: () => Promise<boolean>;
  queryGetUserFollowers: () => Promise<boolean>;
  queryGetUserFollowing: () => Promise<boolean>;
}

const initialState: State = {

}

export const useUserStore = create(immer<State & Action>((_set, _get) => ({
  ...initialState,

  queryGetUser: async () => {
    return false;
  },

  queryEditUser: async () => {
    return false;
  },

  querySearchUser: async () => {
    return false;
  },

  queryGetUserDiscussions: async () => {
    return false;
  },

  queryFollowUser: async () => {
    return false;
  },

  queryGetUserFollowers: async () => {
    return false;
  },

  queryGetUserFollowing: async () => {
    return false;
  },
})))