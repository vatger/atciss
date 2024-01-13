import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { RootState } from "../app/store"
import { selectActiveFir } from "./configSlice"

export const usePollEcfmpByFir: typeof api.useEcfmpByFirQuery = (
  fir,
  options,
) => api.useEcfmpByFirQuery(fir, { pollingInterval: 60000, ...options })

const selectByFir = createSelector(
  selectActiveFir,
  api.endpoints.ecfmpByFir.select,
)
export const selectEcfmpMeasures = createSelector(
  (state: RootState) => state,
  selectByFir,
  (state, selector) => selector(state)?.data ?? [],
)
