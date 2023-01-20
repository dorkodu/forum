import { IUser } from "@api/types/user";
import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { array } from "../lib/array";
import { request, sage } from "./api";
import { useAuthStore } from "./authStore";

interface State {
  user: {
    entities: { [key: string]: IUser }

    // user.followers[userId][followerId] -> IUser
    followers: { [key: string]: { [key: string]: IUser } }

    // user.following[userId][followingId] -> IUser
    following: { [key: string]: { [key: string]: IUser } }
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
  queryEditUser: (name: string | undefined, bio: string | undefined) => Promise<boolean>;
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
        state.user.entities[user.id] = user;
      })
    })
  },


  getUserFollowers: (user) => {
    if (!user) return [];
    const followers = get().user.followers[user.id];
    if (!followers) return [];
    return Object.values(followers);
  },

  getUserFollowing: (user) => {
    if (!user) return [];
    const following = get().user.following[user.id];
    if (!following) return [];
    return Object.values(following);
  },

  addUserFollowers: (user, followers) => {
    get().setUsers(followers);

    set(state => {
      if (!state.user.followers[user.id]) state.user.followers[user.id] = {};
      followers.forEach(follower => { state.user.followers[user.id]![follower.id] = follower })
    })
  },

  addUserFollowing: (user, following) => {
    get().setUsers(following);

    set(state => {
      if (!state.user.following[user.id]) state.user.following[user.id] = {};
      following.forEach(following => { state.user.following[user.id]![following.id] = following })
    })
  },

  removeUserFollowers: (user, followers) => {
    set(state => {
      delete state.user.followers[user.id];
      followers.forEach(follower => { delete state.user.following[follower.id]?.[user.id] })
    })
  },

  removeUserFollowing: (user, following) => {
    set(state => {
      delete state.user.following[user.id];
      following.forEach(_following => { delete state.user.followers[_following.id]?.[user.id] })
    })
  },

  getUserFollowersAnchor: (user, type, refresh) => {
    const followers = get().user.followers[user.id];
    let anchorId = "-1";
    if (followers) anchorId = array.getAnchor(Object.values(followers), "id", "-1", type, refresh);
    return anchorId;
  },

  getUserFollowingAnchor: (user, type, refresh) => {
    const following = get().user.following[user.id];
    let anchorId = "-1";
    if (following) anchorId = array.getAnchor(Object.values(following), "id", "-1", type, refresh);
    return anchorId;
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
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;

      const user = state.user.entities[currentUser.id];
      if (!user) return;

      if (name) user.name = name.trim();
      if (bio) user.name = bio.trim();
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

    const currentUser = useAuthStore.getState().user;
    const targetUser = user;

    set(state => {
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

    if (currentUser && targetUser) {
      if (type) get().addUserFollowing(currentUser, [user]);
      else get().removeUserFollowing(currentUser, [user]);
    }
    if (targetUser) {
      if (currentUser && type) get().addUserFollowers(user, [currentUser]);
      else if (currentUser) get().removeUserFollowers(user, [currentUser]);
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