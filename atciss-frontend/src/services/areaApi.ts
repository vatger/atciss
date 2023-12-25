import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { LatLngTuple } from "leaflet"
import { createSelector } from "@reduxjs/toolkit"
import { createCachedSelector } from "re-reselect"
import { RootState } from "../app/store"

export type AreaBooking = {
  name: string
  polygon: LatLngTuple[]
  lower_limit: number
  upper_limit: number
  start_datetime: string
  end_datetime: string
}

export const areaApi = createApi({
  reducerPath: "areas",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    get: builder.query<AreaBooking[], void>({
      query: () => ({
        url: `areas/`,
      }),
    }),
  }),
})

export const usePollAreas: typeof areaApi.useGetQuery = (_, options) =>
  areaApi.useGetQuery(_, { pollingInterval: 60000, ...options })

const selectAllAreas = createSelector(
  (state: RootState) => state,
  (state) => areaApi.endpoints.get.select()(state)?.data ?? [],
)

// FIXME currently or next active
export const selectArea = createCachedSelector(
  selectAllAreas,
  (_state: RootState, name: string) => name,
  (areas, name) => areas.find((area) => area.name == name),
)((_state, name) => name)
