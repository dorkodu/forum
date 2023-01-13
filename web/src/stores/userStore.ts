import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { request, sage } from "./api";
import { useAppStore } from "./appStore";

interface State {
  authorized: boolean;
}

interface Action {
  queryAuth: () => Promise<boolean>;
  queryGetAccessToken: (code: string) => Promise<boolean>;
}

const initialState: State = {
  authorized: false,
}

export const useUserStore = create(immer<State & Action>((set, _get) => ({
  ...initialState,

  queryAuth: async () => {
    const res = await sage.get(
      { a: sage.query("auth", undefined) },
      (query) => request(query)
    )

    const authorized = !(!res?.a.data || res.a.error);
    set(state => { state.authorized = authorized })
    useAppStore.getState().setAuthLoading(false);
    return authorized;
  },

  queryGetAccessToken: async (code) => {
    const res = await sage.get(
      { a: sage.query("getAccessToken", { code }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    set(state => { state.authorized = status })
    return status;
  },
})))