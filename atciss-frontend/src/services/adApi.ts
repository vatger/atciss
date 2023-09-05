import { createApi } from "@reduxjs/toolkit/query/react"
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
    getByIcaoCodes: builder.query<{ [id: string]: Aerodrome }, string[]>({
      query: (icaoList) => ({
        url: "aerodrome/",
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
  }),
})

export const usePollAdByIcaoCodes: typeof adApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) => adApi.useGetByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })
