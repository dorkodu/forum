import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { useWait } from "../components/hooks"
import i18n from "../lib/i18n"

export interface AppStoreState {
  loading: {
    auth: boolean;
    locale: boolean;
  }

  requestLogin: boolean;
  route:
  "any" |
  "home" |
  "profile" |
  "search" |
  "notifications" |
  "discussion-editor" |
  "menu";

  options: {
    home: {
      feed: "user" | "favourite" | "guest";
      userOrder: "newer" | "older";
      favouriteOrder: "newer" | "older";
      guestOrder: "newer" | "older";
    }

    search: {
      search: string;
      order: "newer" | "older";
    }

    profile: { order: "newer" | "older" }
    followers: { order: "newer" | "older" }
    following: { order: "newer" | "older" }

    discussion: {
      show: "comments" | "arguments";
      commentOrder: "newer" | "older";
      argumentOrder: "newer" | "older" | "top" | "bottom";

      argument: string;
      argumentMode: "edit" | "preview";
      argumentType: boolean;

      comment: string;
      commentMode: "edit" | "preview";
    }

    notifications: { order: "newer" | "older" };

    discussionEditor: {
      id: string | undefined;
      title: string;
      readme: string;
      mode: "edit" | "preview";
    }
  }
}

export interface AppStoreAction {
  setAuthLoading: (loading: boolean) => void;
  setLocaleLoading: (loading: boolean) => void;

  changeLocale: (lang: string) => void;
  setRequestLogin: (status: boolean) => void;
}

const initialState: AppStoreState = {
  loading: {
    auth: true,
    locale: true,
  },

  requestLogin: false,
  route: "any",

  options: {
    home: {
      feed: "guest",
      userOrder: "newer",
      favouriteOrder: "newer",
      guestOrder: "newer",
    },

    search: { search: "", order: "older" },
    profile: { order: "newer" },
    followers: { order: "newer" },
    following: { order: "newer" },

    discussion: {
      show: "arguments",
      commentOrder: "newer",
      argumentOrder: "newer",

      argument: "",
      argumentMode: "edit",
      argumentType: true,

      comment: "",
      commentMode: "edit",
    },

    notifications: { order: "newer" },

    discussionEditor: {
      id: undefined,
      title: "",
      readme: "",
      mode: "edit",
    },
  },
}

export const useAppStore = create(immer<AppStoreState & AppStoreAction>((set, _get) => ({
  ...initialState,

  setAuthLoading: (loading) => {
    set(state => { state.loading.auth = loading })
  },

  setLocaleLoading: (loading) => {
    set(state => { state.loading.locale = loading })
  },

  changeLocale: async (lang) => {
    set(state => { state.loading.locale = true })

    await useWait(async () => {
      await i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
    })();

    set(state => { state.loading.locale = false })
  },

  setRequestLogin: (status) => {
    set(state => { state.requestLogin = status });
  },
})))