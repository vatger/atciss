import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { RootState } from "../app/store"
import { selectAirwayLowerUpper } from "./mapSlice"

export const selectAirways = createSelector(
  (state: RootState) => state,
  selectAirwayLowerUpper,
  (state, hiLo) => api.endpoints.airways.select(hiLo)(state)?.data ?? [],
)
