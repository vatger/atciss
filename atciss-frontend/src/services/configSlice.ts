import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { EBG_SETTINGS } from "../app/config"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

type ActivePositionState = {
  activeEbg: string
}

const configSlice = createSlice({
  name: "config",
  initialState: {
    activeEbg: localStorageOrDefault(
      "config.activeEbg",
      Object.keys(EBG_SETTINGS).shift(),
    ),
  } as ActivePositionState,
  reducers: {
    setActiveEbg(state, { payload }: PayloadAction<string>) {
      state.activeEbg = setLocalStorage("config.activeEbg", payload)
    },
  },
})

export const selectActiveEbg = (store: RootState) => store.config.activeEbg

export const { setActiveEbg } = configSlice.actions
export const { reducer: configReducer } = configSlice
