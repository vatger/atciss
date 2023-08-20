import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

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
  baseQuery: fetchBaseQuery({ baseUrl: "/api/atis/" }),
  endpoints: (builder) => ({
    getByIcaoCode: builder.query<Atis, string>({
      query: (icao) => icao,
    }),
  }),
})

export const usePollAtisByIcaoCode: typeof atisApi.useGetByIcaoCodeQuery = (
  icao,
  options,
) => atisApi.useGetByIcaoCodeQuery(icao, { pollingInterval: 60000, ...options })
