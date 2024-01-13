import { createSelector } from "@reduxjs/toolkit"
import { selectAirportICAOs } from "services/aerodrome"
import { api } from "services/api"
import { RootState } from "../app/store"

export const usePollAtisByIcaoCodes: typeof api.useAtisByIcaoCodesQuery = (
  icao,
  options,
) => api.useAtisByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })

const selectByIcaoCodes = createSelector(
  selectAirportICAOs,
  api.endpoints.atisByIcaoCodes.select,
)
export const selectAllAtis = createSelector(
  (state: RootState) => state,
  selectByIcaoCodes,
  (state, selector) => selector(state)?.data ?? {},
)

export const selectAtis = createSelector(
  (state: RootState) => state,
  selectAllAtis,
  (_state: RootState, icao: string) => icao,
  (state, atis, icao) =>
    atis[icao ?? ""] ??
    api.endpoints.atisByIcaoCodes.select([icao])(state)?.data?.[icao ?? ""],
)
