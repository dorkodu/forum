import { ColorScheme } from "@mantine/core"
import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { changeDateLanguage } from "../lib/date"
import i18n from "../lib/i18n"

interface State {
  loading: {
    auth: boolean
    locale: boolean
  }

  colorScheme: ColorScheme;
}

interface Action {
  setAuthLoading: (loading: boolean) => void;
  setLocaleLoading: (loading: boolean) => void;
  changeLocale: (lang: string) => void;

  toggleColorScheme: (value: ColorScheme) => void;
}

const initialState: State = {
  loading: {
    auth: true,
    locale: true,
  },

  colorScheme: "light",
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

    await Promise.all([i18n.changeLanguage(lang), changeDateLanguage(lang)])
    document.documentElement.lang = lang;

    set(state => { state.loading.locale = false })
  },

  toggleColorScheme(value) {
    set((state) => { state.colorScheme = value });
  },
})))