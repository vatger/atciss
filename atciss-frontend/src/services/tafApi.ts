import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

export const tafApi = createApi({
  reducerPath: "taf",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [id: string]: string }, string[]>({
      query: (icaoList) => ({
        url: `taf`,
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
  }),
})

export const usePollTafByIcaoCodes: typeof tafApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) => tafApi.useGetByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })
