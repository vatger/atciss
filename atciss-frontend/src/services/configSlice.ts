import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { EBG_SETTINGS } from "../app/config"

type ActivePositionState = {
  activeEbg: string
}

const configSlice = createSlice({
  name: "config",
  initialState: {
    activeEbg: Object.keys(EBG_SETTINGS).shift(),
  } as ActivePositionState,
  reducers: {
    setActiveEbg(state, { payload }: PayloadAction<string>) {
      return {
        ...state,
        activeEbg: payload,
      }
    },
  },
})

export const selectActiveEbg = (store: RootState) => store.config.activeEbg

export const { setActiveEbg } = configSlice.actions
export const { reducer: configReducer } = configSlice
