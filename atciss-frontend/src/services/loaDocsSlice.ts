import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"
import { selectActiveFir } from "./configSlice"
import { api } from "./api"

interface LoaDocsState {
  openDocument: string
  viewMode: string
}

const loaDocsSlice = createSlice({
  name: "loaDocs",
  initialState: {
    openDocument: localStorageOrDefault("loa.docs.open", ""),
    viewMode: localStorageOrDefault("loa.viewmode", "agreements"),
  } as LoaDocsState,
  reducers: {
    setOpenDocument(state, { payload: doc }: PayloadAction<string>) {
      state.openDocument = setLocalStorage("loa.docs.open", doc)
    },
    setLoaViewMode(state, { payload: mode }: PayloadAction<string>) {
      state.viewMode = setLocalStorage("loa.viewmode", mode)
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
export const selectLoaViewMode = (store: RootState) => store.loaDocs.viewMode

export const { setOpenDocument, setLoaViewMode } = loaDocsSlice.actions
export const { reducer: loaDocsReducer } = loaDocsSlice
