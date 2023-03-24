import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand"
import { immer } from 'zustand/middleware/immer'
import { wait } from "../components/hooks";
import { request, sage } from "./api";
import { appStore } from "./appStore";
import { discussionStore } from "./discussionStore";
import { userStore } from "./userStore";

interface State {
  userId: string | undefined;
}

interface Action {
  queryAuth: () => Promise<boolean>;
  queryLogout: () => Promise<boolean>;
  queryGetAccessToken: (code: string) => Promise<boolean>;

  reset: () => void;
}

const initialState: State = {
  userId: undefined,
}

export const createAuthStore = (props?: Partial<State>) => {
  return createStore(immer<State & Action>((set, _get) => ({
    ...initialState,
    ...props,

    queryAuth: async () => {
      const res = await sage.get(
        { a: sage.query("auth", undefined) },
        (query) => wait(() => request(query))()
      )

      const status = !(!res?.a.data || res.a.error);
      const user = res?.a.data;

      set(state => { state.userId = user?.id });
      userStore().getState().setUsers(user ? [user] : []);

      return status;
    },

    queryLogout: async () => {
      const res = await sage.get(
        { a: sage.query("logout", undefined) },
        (query) => request(query)
      )

      const status = !(!res?.a.data || res.a.error);

      if (status) {
        appStore().getState().reset();
        authStore().getState().reset();
        discussionStore().getState().reset();
        userStore().getState().reset();
      }

      return status;
    },

    queryGetAccessToken: async (code) => {
      const res = await sage.get(
        { a: sage.query("getAccessToken", { code }) },
        (query) => wait(() => request(query))()
      )

      const status = !(!res?.a.data || res.a.error);
      const user = res?.a.data;

      set(state => { state.userId = user?.id });

      userStore().getState().setUsers(user ? [user] : []);

      return status;
    },

    reset: () => {
      set(initialState);
    }
  })))
}

type AuthStore = ReturnType<typeof createAuthStore>
type AuthProviderProps = React.PropsWithChildren<Partial<State>>

const AuthContext = createContext<AuthStore | null>(null);
let store: AuthStore | undefined = undefined;

export function AuthProvider({ children, ...props }: AuthProviderProps) {
  if (!store) store = createAuthStore(props);

  return (
    <AuthContext.Provider value={store}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthStore<T>(
  selector: (state: State & Action) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(AuthContext);
  if (!store) throw new Error('Missing AuthContext.Provider in the tree');
  return useStore(store, selector, equalityFn);
}

export function authStore() {
  if (!store) throw new Error('Missing AuthContext.Provider in the tree');
  return store;
}