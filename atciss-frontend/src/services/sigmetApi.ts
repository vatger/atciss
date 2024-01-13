import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { RootState } from "../app/store"
import { selectActiveFir, selectNeighbourFirs } from "./configSlice"

export const usePollSigmet: typeof api.useSigmetQuery = (_, options) =>
  api.useSigmetQuery(_, { pollingInterval: 60000, ...options })

const selectByFirs = createSelector(
  selectActiveFir,
  selectNeighbourFirs,
  (activeFir, neighbourFirs) =>
    api.endpoints.sigmet.select([activeFir, ...neighbourFirs]),
)
export const selectSigmets = createSelector(
  (state: RootState) => state,

  selectByFirs,
  (state, selector) => selector(state)?.data ?? [],
)
