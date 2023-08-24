import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { DateTime } from "luxon"

type AerodromeIn = Omit<Aerodrome, "sunrise" | "sunset"> & {
  sunrise: string
  sunset: string
}

export interface Aerodrome {
  locationIndicatorICAO: string
  latitude: number
  longitude: number
  elevation: number
  sunrise: DateTime
  sunset: DateTime
}

export const adApi = createApi({
  reducerPath: "ad",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/ad/" }),
  endpoints: (builder) => ({
    getByIcaoCode: builder.query<Aerodrome, string>({
      query: (icao) => icao,
      transformResponse: (ad: AerodromeIn) =>
        ({
          ...ad,
          sunrise: DateTime.fromISO(ad.sunrise).toUTC(),
          sunset: DateTime.fromISO(ad.sunset).toUTC(),
        } as Aerodrome),
    }),
  }),
})

export const usePollAdByIcaoCode: typeof adApi.useGetByIcaoCodeQuery = (
  icao,
  options,
) => adApi.useGetByIcaoCodeQuery(icao, { pollingInterval: 60000, ...options })
