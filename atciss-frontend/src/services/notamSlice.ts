import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

interface NotamState {
  readFiltered: boolean
}

const notamSlice = createSlice({
  name: "notamView",
  initialState: {
    readFiltered: localStorageOrDefault("notam.readFiltered", false),
  } as NotamState,
  reducers: {
    setReadFiltered(state, { payload: filtered }: PayloadAction<boolean>) {
      state.readFiltered = setLocalStorage("map.readFiltered", filtered)
    },
  },
})

export const selectReadFiltered = (store: RootState) =>
  store.notamView.readFiltered

export const { setReadFiltered } = notamSlice.actions
export const { reducer: notamReducer } = notamSlice
