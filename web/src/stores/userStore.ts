import { IUser } from "@api/types/user";
import { INotification } from "@api/types/notification";
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

    // Search results
    search: string[]

    notifications: { [key: string]: INotification }
  }
}

interface Action {
  getUserById: (userId: string | undefined) => IUser | undefined;
  getUserByUsername: (username: string | undefined) => IUser | undefined;

  setUsers: (users: IUser[]) => void;

  getSearchUsers: (type: "newer" | "older") => IUser[];
  addSearchUsers: (users: IUser[], refresh?: boolean) => void;

  getUserFollowers: (user: IUser | undefined, type: "newer" | "older") => IUser[];
  getUserFollowing: (user: IUser | undefined, type: "newer" | "older") => IUser[];
  addUserFollowers: (user: IUser, followers: IUser[]) => void;
  addUserFollowing: (user: IUser, following: IUser[]) => void;
  removeUserFollowers: (user: IUser, followers: IUser[]) => void;
  removeUserFollowing: (user: IUser, following: IUser[]) => void;
  getUserFollowersAnchor: (user: IUser, type: "newer" | "older", refresh?: boolean) => string;
  getUserFollowingAnchor: (user: IUser, type: "newer" | "older", refresh?: boolean) => string;

  getNotifications: (type: "newer" | "older") => INotification[];
  setNotifications: (notifications: INotification[]) => void;
  getNotificationsAnchor: (type: "newer" | "older", refresh?: boolean) => string;

  queryGetUser: () => Promise<boolean>;
  querySearchUser: () => Promise<boolean>;

  queryFollowUser: (user: IUser) => Promise<boolean>;
  queryBlockUser: (user: IUser) => Promise<boolean>;

  queryGetUserDiscussions: () => Promise<boolean>;
  queryGetUserFollowers: () => Promise<boolean>;
  queryGetUserFollowing: () => Promise<boolean>;

  reset: () => void;
}

const initialState: State = {
  user: {
    entities: {}, followers: {}, following: {}, search: [], notifications: {}
  },
}

export const useUserStore = create(immer<State & Action>((set, get) => ({
  ...initialState,

  getUserById: (userId) => {
    if (!userId) return undefined;
    return get().user.entities[userId];
  },

  getUserByUsername: (username) => {
    if (!username) return undefined;
    const usernameCi = username.toLowerCase();

    const users = Object.values(get().user.entities);
    for (let i = 0; i < users.length; ++i) {
      const user = users[i];
      if (user && user.username.toLowerCase() !== usernameCi) continue;
      return user;
    }

    return undefined;
  },

  setUsers: (users) => {
    set(state => {
      users.forEach((user) => { state.user.entities[user.id] = user });
    })
  },


  getSearchUsers: (type) => {
    const out: IUser[] = [];
    const keys = get().user.search;
    keys.forEach(key => {
      const user = get().user.entities[key];
      if (user) out.push(user);
    })

    return array.sort(out, "joinDate", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  addSearchUsers: (users, refresh) => {
    set(state => {
      if (refresh) state.user.search = [];
      users.forEach((user) => { state.user.search.push(user.id) });
    })
  },


  getUserFollowers: (user, type) => {
    if (!user) return [];
    const followers = get().user.followers[user.id];
    if (!followers) return [];

    const out: IUser[] = [];
    const keys = Object.keys(followers);
    keys.forEach(key => {
      const user = get().user.entities[key];
      if (user) out.push(user);
    })

    return array.sort(out, "joinDate", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  getUserFollowing: (user, type) => {
    if (!user) return [];
    const following = get().user.following[user.id];
    if (!following) return [];

    const out: IUser[] = [];
    const keys = Object.keys(following);
    keys.forEach(key => {
      const user = get().user.entities[key];
      if (user) out.push(user);
    })

    return array.sort(out, "joinDate", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  addUserFollowers: (user, followers) => {
    set(state => {
      if (!state.user.followers[user.id]) state.user.followers[user.id] = {};

      followers.forEach(follower => {
        state.user.followers[user.id]![follower.id] = true;
      });
    })
  },

  addUserFollowing: (user, following) => {
    set(state => {
      if (!state.user.following[user.id]) state.user.following[user.id] = {};

      following.forEach(_following => {
        state.user.following[user.id]![_following.id] = true;
      });
    })
  },

  removeUserFollowers: (user, followers) => {
    set(state => {
      followers.forEach(follower => {
        delete state.user.followers[user.id]?.[follower.id];
      });
    })
  },

  removeUserFollowing: (user, following) => {
    set(state => {
      following.forEach(_following => {
        delete state.user.following[user.id]?.[_following.id];
      });
    })
  },

  getUserFollowersAnchor: (user, type, refresh) => {
    return array.getAnchor(get().getUserFollowers(user, "newer"), "id", "-1", type, refresh);
  },

  getUserFollowingAnchor: (user, type, refresh) => {
    return array.getAnchor(get().getUserFollowing(user, "newer"), "id", "-1", type, refresh);
  },


  getNotifications: (type) => {
    const object = get().user.notifications;
    if (!object) return [];

    const out: INotification[] = [];
    const keys = Object.keys(object);
    keys.forEach(key => {
      const notification = get().user.notifications[key];
      if (notification) out.push(notification);
    })

    return array.sort(out, "date", type === "newer" ? ((a, b) => b - a) : ((a, b) => a - b));
  },

  setNotifications: (notifications) => {
    set(state => {
      notifications.forEach(notification => {
        state.user.notifications[notification.id] = notification;
      })
    })
  },

  getNotificationsAnchor: (type, refresh) => {
    return array.getAnchor(get().getNotifications("newer"), "id", "-1", type, refresh);
  },


  queryGetUser: async () => {
    return false;
  },

  querySearchUser: async () => {
    return false;
  },

  queryBlockUser: async (user) => {
    const type = !user.blocker;

    const res = await sage.get(
      { a: sage.query("blockUser", { userId: user.id, type: type }) },
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

      // If blocking
      if (current && target && type) {
        target.blocker = true;

        // If the current user is following the target user
        if (target.follower) {
          current.followingCount += -1;
          target.followerCount += -1;
          target.follower = false;
        }
        // If the target user is following the current user
        if (target.following) {
          target.followingCount += -1;
          current.followerCount += -1;
          target.following = false;
        }
      }
      // If unblocking
      else if (current && target && !type) {
        target.blocker = false;
      }
    })

    if (status && currentUser && targetUser && type) {
      // If the current user is following the target user
      if (targetUser.follower) {
        get().removeUserFollowing(currentUser, [targetUser]);
        get().removeUserFollowers(targetUser, [currentUser]);
      }
      // If the target user is following the current user
      if (targetUser.following) {
        get().removeUserFollowing(targetUser, [currentUser]);
        get().removeUserFollowers(currentUser, [targetUser]);
      }
    }

    return status;
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

      if (current) {
        current.followingCount += type ? +1 : -1;
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

  queryGetUserDiscussions: async () => {
    return false;
  },

  queryGetUserFollowers: async () => {
    return false;
  },

  queryGetUserFollowing: async () => {
    return false;
  },

  reset: () => {
    set(initialState);
  }
})))