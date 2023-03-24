import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand"
import { immer } from 'zustand/middleware/immer'

interface State {
  requestLogin: boolean;

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

interface Action {
  setRequestLogin: (status: boolean) => void;
  reset: () => void;
}

const initialState: State = {
  requestLogin: false,

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

export const createAppStore = (props?: Partial<State>) => {
  return createStore(immer<State & Action>((set, _get) => ({
    ...initialState,
    ...props,

    setRequestLogin: (status) => {
      set(state => { state.requestLogin = status });
    },

    reset: () => {
      set(initialState);
    }
  })))
}

type AppStore = ReturnType<typeof createAppStore>
type AppProviderProps = React.PropsWithChildren<Partial<State>>

const AppContext = createContext<AppStore | null>(null);
let store: AppStore | undefined = undefined;

export function AppProvider({ children, ...props }: AppProviderProps) {
  if (!store) store = createAppStore(props);

  return (
    <AppContext.Provider value={store}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppStore<T>(
  selector: (state: State & Action) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(AppContext);
  if (!store) throw new Error('Missing AppContext.Provider in the tree');
  return useStore(store, selector, equalityFn);
}

export function appStore() {
  if (!store) throw new Error('Missing AppContext.Provider in the tree');
  return store;
}