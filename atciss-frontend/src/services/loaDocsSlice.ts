import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"
import { selectActiveFir } from "./configSlice"
import { api } from "./api"

interface LoaDocsState {
  openDocument: string
}

const loaDocsSlice = createSlice({
  name: "loaDocs",
  initialState: {
    openDocument: localStorageOrDefault("loa.docs.open", ""),
  } as LoaDocsState,
  reducers: {
    setOpenDocument(state, { payload: doc }: PayloadAction<string>) {
      state.openDocument = setLocalStorage("loa.docs.open", doc)
    },
  },
})

const selectByFir = createSelector(
  selectActiveFir,
  api.endpoints.loaDocsByFir.select,
)
export const selectLoaDocs = createSelector(
  (state: RootState) => state,
  selectByFir,
  (state, selector) => selector(state)?.data ?? [],
)

export const selectOpenDocument = (store: RootState) =>
  store.loaDocs.openDocument

export const { setOpenDocument } = loaDocsSlice.actions
export const { reducer: loaDocsReducer } = loaDocsSlice
