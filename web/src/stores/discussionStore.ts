import { create } from "zustand"
import { immer } from 'zustand/middleware/immer'

interface State {

}

interface Action {

}

const initialState: State = {

}

export const useDiscussionStore = create(immer<State & Action>((_set, _get) => ({
  ...initialState,
})))