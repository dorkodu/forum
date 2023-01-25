import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { request, sage } from "./api";
import { useAppStore } from "./appStore";
import { useUserStore } from "./userStore";

interface State {
  userId: string | undefined;
}

interface Action {
  queryAuth: () => Promise<boolean>;
  queryGetAccessToken: (code: string) => Promise<boolean>;
}

const initialState: State = {
  userId: undefined,
}

export const useAuthStore = create(immer<State & Action>((set, _get) => ({
  ...initialState,

  queryAuth: async () => {
    const res = await sage.get(
      { a: sage.query("auth", undefined) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const user = res?.a.data;

    set(state => { state.userId = user?.id });

    useUserStore.getState().setUsers(user ? [user] : []);
    useAppStore.getState().setAuthLoading(false);

    return status;
  },

  queryGetAccessToken: async (code) => {
    const res = await sage.get(
      { a: sage.query("getAccessToken", { code }) },
      (query) => request(query)
    )

    const status = !(!res?.a.data || res.a.error);
    const user = res?.a.data;

    set(state => { state.userId = user?.id });

    useUserStore.getState().setUsers(user ? [user] : []);
    // TODO: setAuthLoading is already called in queryAuth, fix it somehow

    return status;
  },
})))