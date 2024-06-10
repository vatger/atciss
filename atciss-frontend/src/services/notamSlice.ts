import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

interface NotamState {
  inactiveFiltered: boolean
  readFiltered: boolean
}

const notamSlice = createSlice({
  name: "notamView",
  initialState: {
    inactiveFiltered: localStorageOrDefault("notam.inactiveFiltered", false),
    readFiltered: localStorageOrDefault("notam.readFiltered", false),
  } as NotamState,
  reducers: {
    setInactiveFiltered(state, { payload: filtered }: PayloadAction<boolean>) {
      state.inactiveFiltered = setLocalStorage("map.inactiveFiltered", filtered)
    },
    setReadFiltered(state, { payload: filtered }: PayloadAction<boolean>) {
      state.readFiltered = setLocalStorage("map.readFiltered", filtered)
    },
  },
})

export const selectInactiveFiltered = (store: RootState) =>
  store.notamView.inactiveFiltered

export const selectReadFiltered = (store: RootState) =>
  store.notamView.readFiltered

export const { setReadFiltered, setInactiveFiltered } = notamSlice.actions
export const { reducer: notamReducer } = notamSlice
