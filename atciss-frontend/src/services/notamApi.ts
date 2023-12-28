import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { selectNotamDesignators } from "./configSlice"
import { createCachedSelector } from "re-reselect"
import { DateTime } from "luxon"
import { selectReadFiltered } from "./notamSlice"

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
  tagTypes: ["notamSeen"],
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [icao: string]: Notam[] }, string[]>({
      query: (icaoList) => ({
        url: "notam/",
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
    getSeen: builder.query<string[], void>({
      query: () => ({
        url: "notam/read",
      }),
      providesTags: ["notamSeen"],
    }),
    seen: builder.mutation<void, string>({
      query: (id) => ({
        url: "notam/read",
        params: { id },
        method: "POST",
      }),
      invalidatesTags: ["notamSeen"],
    }),
    unseen: builder.mutation<void, string>({
      query: (id) => ({
        url: "notam/read",
        params: { id },
        method: "DELETE",
      }),
      invalidatesTags: ["notamSeen"],
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

const selectReadNotamIds = createSelector(
  (state: RootState) => state,
  (state) => notamApi.endpoints.getSeen.select()(state)?.data ?? [],
)

export const selectNotamIsRead = createCachedSelector(
  selectReadNotamIds,
  (_state: RootState, icao: string) => icao,
  (readNotamIds, notamId) => readNotamIds.includes(notamId),
)((_state, notamId) => notamId)

export const selectNotamsByDesignator = createCachedSelector(
  selectAllNotams,
  selectReadFiltered,
  selectReadNotamIds,
  (_state: RootState, icao: string) => icao,
  (notams, readFiltered, readNotams, icao) => {
    const icaoNotams = (notams[icao ?? ""] ?? []).filter(
      (n) => DateTime.utc() <= DateTime.fromISO(n.valid_till).toUTC(),
    )

    return {
      notams: icaoNotams.filter(
        (n) => !readFiltered || !readNotams.includes(n.notam_id),
      ),
      total: icaoNotams.length,
    }
  },
)((_state, icao) => icao)

export const selectActiveNotamsByDesignator = createCachedSelector(
  selectNotamsByDesignator,
  (_state: RootState, icao: string) => icao,
  (notams) =>
    notams.notams
      .filter((n) => DateTime.utc() >= DateTime.fromISO(n.valid_from).toUTC())
      .sort((n1, n2) => n1.notam_code.localeCompare(n2.notam_code)),
)((_state, icao) => icao)

export const selectInactiveNotamsByDesignator = createCachedSelector(
  selectNotamsByDesignator,
  (_state: RootState, icao: string) => icao,
  (notams) =>
    notams.notams
      .filter((n) => DateTime.utc() < DateTime.fromISO(n.valid_from).toUTC())
      .sort((n1, n2) =>
        DateTime.fromISO(n1.valid_from).toUTC() <
        DateTime.fromISO(n2.valid_from).toUTC()
          ? -1
          : 1,
      ),
)((_state, icao) => icao)

export const selectTotalNotamsByDesignator = createCachedSelector(
  selectNotamsByDesignator,
  (_state: RootState, icao: string) => icao,
  (notams) => notams.total,
)((_state, icao) => icao)
