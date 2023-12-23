import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { RootState } from "../app/store"
import { createSelector } from "@reduxjs/toolkit"
import { selectStatusSectors } from "./atisAfwSlice"

export type StatusEnum = "0" | "1" | "2" | "3"

export interface SectorStatus {
  id: string
  status: StatusEnum
  changed_by_cid: string
  updated_at: string
}

export const sectorstatusApi = createApi({
  reducerPath: "sectorstatus",
  baseQuery: fetchWithAuth,
  tagTypes: ["sectorstatus"],
  endpoints: (builder) => ({
    getByIds: builder.query<{ [id: string]: SectorStatus }, string[]>({
      query: (ids) => ({
        url: `sectorstatus`,
        params: ids.map((id) => ["id", id]),
      }),
      providesTags: (result) =>
        result
          ? [
              "sectorstatus",
              ...Object.keys(result).map((id) => ({
                type: "sectorstatus" as const,
                id,
              })),
            ]
          : ["sectorstatus"],
    }),
    edit: builder.mutation<SectorStatus, Pick<SectorStatus, "id" | "status">>({
      query: (body) => ({
        url: "sectorstatus",
        body,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: "sectorstatus", id: arg.id }],
    }),
  }),
})

export const usePollSectorStatus: typeof sectorstatusApi.useGetByIdsQuery = (
  ids,
  options,
) =>
  sectorstatusApi.useGetByIdsQuery(ids, { pollingInterval: 5000, ...options })

export const selectSectorStatus = createSelector(
  (state: RootState) => state,
  selectStatusSectors,
  (state, ids) =>
    sectorstatusApi.endpoints.getByIds.select(ids.flat())(state)?.data ?? {},
)
