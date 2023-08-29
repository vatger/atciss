import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { LOCAL_STORAGE_JWT_KEY } from "../app/auth/slice"
import { fetchWithAuth } from "../app/auth"

export interface Aerodrome {
  locationIndicatorICAO: string
  latitude: number
  longitude: number
  elevation: number
  sunrise: string
  sunset: string
}

export const adApi = createApi({
  reducerPath: "ad",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByIcaoCode: builder.query<Aerodrome, string>({
      query: (icao) => `ad/${icao}`,
    }),
  }),
})

export const usePollAdByIcaoCode: typeof adApi.useGetByIcaoCodeQuery = (
  icao,
  options,
) => adApi.useGetByIcaoCodeQuery(icao, { pollingInterval: 60000, ...options })
