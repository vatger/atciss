import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

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
    getByIcaoCode: builder.query<Atis, string>({
      query: (icao) => `atis/${icao}`,
    }),
  }),
})

export const usePollAtisByIcaoCode: typeof atisApi.useGetByIcaoCodeQuery = (
  icao,
  options,
) => atisApi.useGetByIcaoCodeQuery(icao, { pollingInterval: 60000, ...options })
