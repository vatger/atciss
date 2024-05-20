import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { selectActiveFir } from "./configSlice"
import { api } from "services/api"

export interface Initials {
  fir: string
  cid: string
  id: string
  initials: string
}

const selectByFir = createSelector(
  selectActiveFir,
  api.endpoints.initialsByFir.select,
)
export const selectInitials = createSelector(
  (state: RootState) => state,
  selectByFir,
  (state, selector) => selector(state)?.data ?? [],
)
