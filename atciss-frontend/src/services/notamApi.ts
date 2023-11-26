import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { selectNotamDesignators } from "./configSlice"
import createCachedSelector from "re-reselect"
import { DateTime } from "luxon"

export type Notam = {
  full_text: string
  notam_id: string
  notam_type: string
  ref_notam_id: string | null
  fir: string
  notam_code: string
  traffic_type: string[]
  purpose: string[]
  scope: string[]
  fl_lower: number
  fl_upper: number
  area: { [index: string]: string | number }
  location: string[]
  valid_from: string
  valid_till: string
  schedule: string | null
  body: string
  limit_lower: string | null
  limit_upper: string | null
  source: string | null
  created: string | null
}

export const notamApi = createApi({
  reducerPath: "notam",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [icao: string]: Notam[] }, string[]>({
      query: (icaoList) => ({
        url: "notam/",
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
  }),
})

export const usePollNotamByIcaoCodes: typeof notamApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) =>
  notamApi.useGetByIcaoCodesQuery(icao, {
    pollingInterval: 3600000,
    ...options,
  })

const selectAllNotams = createSelector(
  (state: RootState) => state,
  selectNotamDesignators,
  (state, icaos) =>
    notamApi.endpoints.getByIcaoCodes.select(icaos)(state)?.data ?? {},
)

export const selectNotamsByDesignator = createCachedSelector(
  [selectAllNotams, (_state: RootState, icao: string) => icao],
  (notams, icao) => notams[icao ?? ""] ?? [],
)((_state, icao) => icao)

export const selectActiveNotamsByDesignator = createCachedSelector(
  [selectNotamsByDesignator, (_state: RootState, icao: string) => icao],
  (notams) =>
    notams
      .filter(
        (n) =>
          DateTime.utc() <= DateTime.fromISO(n.valid_till).toUTC() &&
          DateTime.utc() >= DateTime.fromISO(n.valid_from).toUTC(),
      )
      .sort((n1, n2) => n1.notam_code.localeCompare(n2.notam_code)),
)((_state, icao) => icao)

export const selectInactiveNotamsByDesignator = createCachedSelector(
  [selectNotamsByDesignator, (_state: RootState, icao: string) => icao],
  (notams) =>
    notams
      .filter((n) => DateTime.utc() < DateTime.fromISO(n.valid_from).toUTC())
      .sort((n1, n2) =>
        DateTime.fromISO(n1.valid_from).toUTC() <
        DateTime.fromISO(n2.valid_from).toUTC()
          ? -1
          : 1,
      ),
)((_state, icao) => icao)
