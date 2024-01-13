import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { RootState } from "../app/store"
import { selectLoaCops } from "./loaApi"
import { selectSearch, selectSelectedAirway } from "./mapSlice"

const selectByLoaCops = createSelector(
  selectLoaCops,
  api.endpoints.navaidsByDesignators.select,
)
const selectLoaNavaids = createSelector(
  (state: RootState) => state,
  selectByLoaCops,
  (state, selector) => selector(state)?.data ?? [],
)

export const selectLoaNavaid = createSelector(
  selectLoaNavaids,
  (_state: RootState, designator: string) => designator,
  (navaids, designator) => navaids.find((n) => n.designator == designator),
)

const selectBySearch = createSelector(
  selectSearch,
  api.endpoints.searchNavaids.select,
)
export const selectSearchedNavaids = createSelector(
  (state: RootState) => state,
  selectBySearch,
  (state, selector) => selector(state)?.data ?? [],
)

const selectByAirway = createSelector(
  selectSelectedAirway,
  api.endpoints.navaidsByAirway.select,
)
export const selectAirwayNavaids = createSelector(
  (state: RootState) => state,
  selectByAirway,
  (state, selector) => selector(state)?.data ?? [],
)
