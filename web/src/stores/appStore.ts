import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { useWait } from "../components/hooks"
import { changeDateLanguage } from "../lib/date"
import i18n from "../lib/i18n"

interface State {
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
      commentType: "newer" | "older";
      argumentType: "newer" | "older" | "top" | "bottom";
    }

    notifications: { order: "newer" | "older" };
  }
}

interface Action {
  setAuthLoading: (loading: boolean) => void;
  setLocaleLoading: (loading: boolean) => void;

  changeLocale: (lang: string) => void;
  setRequestLogin: (status: boolean) => void;
}

const initialState: State = {
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
      commentType: "newer",
      argumentType: "newer",
    },
    notifications: { order: "newer" },
  },
}

export const useAppStore = create(immer<State & Action>((set, _get) => ({
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
      await Promise.all([i18n.changeLanguage(lang), changeDateLanguage(lang)]);
      document.documentElement.lang = lang;
    })();

    set(state => { state.loading.locale = false })
  },

  setRequestLogin: (status) => {
    set(state => { state.requestLogin = status });
  },
})))