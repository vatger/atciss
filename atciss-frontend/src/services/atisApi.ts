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
    getByIcaoCodes: builder.query<{ [id: string]: Atis }, string[]>({
      query: (icaoList) => ({
        url: `atis/`,
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
  }),
})

export const usePollAtisByIcaoCodes: typeof atisApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) =>
  atisApi.useGetByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })
