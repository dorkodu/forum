import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'

interface State {
  authorized: boolean;
}

interface Action {

}

const initialState: State = {
  authorized: false,
}

export const useUserStore = create(immer<State & Action>((set, get) => ({
  ...initialState,
})))