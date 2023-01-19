import { IUser } from "@api/types/user";
import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'

interface State {
  user: {
    entities: { [key: string]: IUser }
  }
}

interface Action {
  getUserById: (userId: string | undefined) => IUser | undefined;

  setUsers: (users: IUser[]) => void;

  queryGetUser: () => Promise<boolean>;
  queryEditUser: () => Promise<boolean>;
  querySearchUser: () => Promise<boolean>;

  queryGetUserDiscussions: () => Promise<boolean>;

  queryFollowUser: () => Promise<boolean>;
  queryGetUserFollowers: () => Promise<boolean>;
  queryGetUserFollowing: () => Promise<boolean>;
}

const initialState: State = {
  user: { entities: {} },
}

export const useUserStore = create(immer<State & Action>((set, get) => ({
  ...initialState,

  getUserById: (userId) => {
    if (!userId) return undefined;
    return get().user.entities[userId];
  },

  setUsers: (users) => {
    set(state => {
      users.forEach((user) => {
        state.user.entities[user.id] = user;
      })
    })
  },

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