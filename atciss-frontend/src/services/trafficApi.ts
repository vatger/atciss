import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

export interface Traffic {
  callsign: string
  departure_icao: string
  departure: string
  destination_icao: string
  destination: string
  ac_type: string
  groundspeed: number
  eta?: string
}

export interface AerodromeTraffic {
  aerodrome: string
  arrivals: Traffic[]
  departures: Traffic[]
}

export const trafficApi = createApi({
  reducerPath: "traffic_data",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    get: builder.query<AerodromeTraffic, string>({
      query: (q) => ({
        url: `traffic`,
        params: { icao: q },
      }),
    }),
  }),
})

export const usePollGetTraffic: typeof trafficApi.useGetQuery = (
  icao,
  options,
) =>
  trafficApi.useGetQuery(icao, {
    pollingInterval: 60000,
    ...options,
  })
