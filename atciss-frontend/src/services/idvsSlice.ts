import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

type ConfigState = {
  activeAerodrome: string
}

const idvsSlice = createSlice({
  name: "idvs",
  initialState: {
    activeAerodrome: localStorageOrDefault("idvs.activeAerodrome", "EDDM"),
  } as ConfigState,
  reducers: {
    setActiveAerodrome(state, { payload }: PayloadAction<string>) {
      state.activeAerodrome = setLocalStorage("idvs.activeAerodrome", payload)
    },
  },
})

export const selectActiveAerodrome = (store: RootState) =>
  store.idvs.activeAerodrome

export const { setActiveAerodrome } = idvsSlice.actions
export const { reducer: idvsReducer } = idvsSlice
