import { RootState } from "../app/store"
import { createSelector } from "@reduxjs/toolkit"
import { selectActiveFir } from "./configSlice"
import { api } from "services/api"

const selectByFir = createSelector(
  selectActiveFir,
  api.endpoints.aliases.select,
)
export const selectAliases = createSelector(
  (state: RootState) => state,
  selectByFir,
  (state, selector) => selector(state)?.data ?? [],
)
