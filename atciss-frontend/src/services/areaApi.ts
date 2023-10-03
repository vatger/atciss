import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { LatLngTuple } from "leaflet"

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
