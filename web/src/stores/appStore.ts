import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { changeDateLanguage } from "../lib/date"
import i18n from "../lib/i18n"

interface State {
  loading: {
    auth: boolean
    locale: boolean
  }
}

interface Action {
  setAuthLoading: (loading: boolean) => void;
  setLocaleLoading: (loading: boolean) => void;
  changeLocale: (lang: string) => void;
}

const initialState: State = {
  loading: {
    auth: true,
    locale: true,
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

    await Promise.all([i18n.changeLanguage(lang), changeDateLanguage(lang)])
    document.documentElement.lang = lang;

    set(state => { state.loading.locale = false })
  },
})))