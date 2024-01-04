import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { createSelector } from "@reduxjs/toolkit"
import { selectAirportICAOs } from "./sectorApi"
import { RootState } from "../app/store"
import { createCachedSelector } from "re-reselect"

export interface Atis {
  cid: number
  name: string
  callsign: string
  frequency: string
  atis_code: string
  text_atis: string
  runways_in_use: string[]
}

export const atisApi = createApi({
  reducerPath: "atis",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [id: string]: Atis }, string[]>({
      query: (icaoList) => ({
        url: `atis`,
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
  }),
})

export const usePollAtisByIcaoCodes: typeof atisApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) =>
  atisApi.useGetByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })

export const selectAllAtis = createSelector(
  (state: RootState) => state,
  selectAirportICAOs,
  (state, ads) =>
    atisApi.endpoints.getByIcaoCodes.select(ads)(state)?.data ?? {},
)

export const selectAtis = createCachedSelector(
  (state: RootState) => state,
  selectAllAtis,
  (_state: RootState, icao: string) => icao,
  (state, atis, icao) =>
    atis[icao ?? ""] ??
    atisApi.endpoints.getByIcaoCodes.select([icao])(state)?.data?.[icao ?? ""],
)((_state, icao) => icao)
