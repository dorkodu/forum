import { IUser } from "@api/types/user";
import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { array } from "../lib/array";
import { request, sage } from "./api";
import { useAuthStore } from "./authStore";

interface State {
  user: {
    entities: { [key: string]: IUser }

    // user.followers[userId][followerId] -> boolean
    followers: { [key: string]: { [key: string]: boolean } }

    // user.following[userId][followingId] -> boolean
    following: { [key: string]: { [key: string]: boolean } }
  }
}

interface Action {
  getUserById: (userId: string | undefined) => IUser | undefined;
  getUserByUsername: (username: string | undefined) => IUser | undefined;

  setUsers: (users: IUser[]) => void;

  getUserFollowers: (user: IUser | undefined) => IUser[];
  getUserFollowing: (user: IUser | undefined) => IUser[];
  addUserFollowers: (user: IUser, followers: IUser[]) => void;
  addUserFollowing: (user: IUser, following: IUser[]) => void;
  removeUserFollowers: (user: IUser, followers: IUser[]) => void;
  removeUserFollowing: (user: IUser, following: IUser[]) => void;
  getUserFollowersAnchor: (user: IUser, type: "newer" | "older", refresh?: boolean) => string;
  getUserFollowingAnchor: (user: IUser, type: "newer" | "older", refresh?: boolean) => string;

  queryGetUser: () => Promise<boolean>;
  queryEditUser: (name: string, bio: string) => Promise<boolean>;
  querySearchUser: () => Promise<boolean>;

  queryGetUserDiscussions: () => Promise<boolean>;

  queryFollowUser: (user: IUser) => Promise<boolean>;
  queryGetUserFollowers: () => Promise<boolean>;
  queryGetUserFollowing: () => Promise<boolean>;
}

const initialState: State = {
  user: { entities: {}, followers: {}, following: {} },
}

export const useUserStore = create(immer<State & Action>((set, get) => ({
  ...initialState,

  getUserById: (userId) => {
    if (!userId) return undefined;
    return get().user.entities[userId];
  },

  getUserByUsername: (username) => {
    if (!username) return undefined;

    const users = Object.values(get().user.entities);
    for (let i = 0; i < users.length; ++i) {
      const user = users[i];
      if (user && user.username !== username) continue;
      return user;
    }

    return undefined;
  },

  setUsers: (users) => {
    set(state => {
      users.forEach((user) => {
        if (!state.user.entities[user.id]) state.user.entities[user.id] = user;
      })
    })
  },


  getUserFollowers: (user) => {
    if (!user) return [];
    const followers = get().user.followers[user.id];
    if (!followers) return [];

    const out: IUser[] = [];
    const keys = Object.keys(followers);
    keys.forEach(key => {
      const user = get().user.entities[key];
      if (user) out.push(user);
    })

    return out;
  },

  getUserFollowing: (user) => {
    if (!user) return [];
    const following = get().user.following[user.id];
    if (!following) return [];

    const out: IUser[] = [];
    const keys = Object.keys(following);
    keys.forEach(key => {
      const user = get().user.entities[key];
      if (user) out.push(user);
    })

    return out;
  },

  addUserFollowers: (user, followers) => {
    set(state => {
      if (!state.user.followers[user.id]) state.user.followers[user.id] = {};
      followers.forEach(follower => { state.user.followers[user.id]![follower.id] = true })
    })
  },

  addUserFollowing: (user, following) => {
    set(state => {
      if (!state.user.following[user.id]) state.user.following[user.id] = {};
      following.forEach(_following => { state.user.following[user.id]![_following.id] = true })
    })
  },

  removeUserFollowers: (user, followers) => {
    set(state => {
      delete state.user.followers[user.id];
      followers.forEach(follower => { delete state.user.followers[follower.id]?.[user.id] })
    })
  },

  removeUserFollowing: (user, following) => {
    set(state => {
      delete state.user.following[user.id];
      following.forEach(_following => { delete state.user.following[_following.id]?.[user.id] })
    })
  },

  getUserFollowersAnchor: (user, type, refresh) => {
    return array.getAnchor(get().getUserFollowers(user), "id", "-1", type, refresh);
  },

  getUserFollowingAnchor: (user, type, refresh) => {
    return array.getAnchor(get().getUserFollowing(user), "id", "-1", type, refresh);
  },


  queryGetUser: async () => {
    return false;
  },

  queryEditUser: async (name, bio) => {
    const res = await sage.get(
      { a: sage.query("editUser", { name, bio }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);

    set(state => {
      if (!status) return;

      const currentUserId = useAuthStore.getState().userId;
      if (!currentUserId) return;

      const user = state.user.entities[currentUserId];
      if (!user) return;

      user.name = name.trim();
      user.bio = bio.trim();
    })

    return status;
  },

  querySearchUser: async () => {
    return false;
  },

  queryGetUserDiscussions: async () => {
    return false;
  },

  queryFollowUser: async (user) => {
    const type = !user.follower;

    const res = await sage.get(
      { a: sage.query("followUser", { userId: user.id, type: type }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);

    const currentUserId = useAuthStore.getState().userId;
    const currentUser = currentUserId && get().user.entities[currentUserId];
    const targetUser = user;

    set(state => {
      if (!status) return;

      const current = currentUser && state.user.entities[currentUser.id];
      const target = state.user.entities[targetUser.id];

      if (current && target) {
        current.followingCount += type ? +1 : -1;
        target.following = type;
      }
      if (target) {
        target.followerCount += type ? +1 : -1;
        target.follower = type;
      }
    })

    if (status && currentUser && targetUser) {
      if (type) get().addUserFollowing(currentUser, [targetUser]);
      else get().removeUserFollowing(currentUser, [targetUser]);

      if (type) get().addUserFollowers(targetUser, [currentUser]);
      else get().removeUserFollowers(targetUser, [currentUser]);
    }

    return status;
  },

  queryGetUserFollowers: async () => {
    return false;
  },

  queryGetUserFollowing: async () => {
    return false;
  },
})))