import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

export type Notam = {
  full_text: string
  notam_id: string
  notam_type: string
  ref_notam_id: string | null
  fir: string
  notam_code: string
  traffic_type: string[]
  purpose: string[]
  scope: string[]
  fl_lower: number
  fl_upper: number
  area: { [index: string]: string | number }
  location: string[]
  valid_from: string
  valid_till: string
  schedule: string | null
  body: string
  limit_lower: string | null
  limit_upper: string | null
  source: string | null
  created: string | null
}

export const notamApi = createApi({
  reducerPath: "notam",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [icao: string]: Notam[] }, string[]>({
      query: (icaoList) => ({
        url: "notam/",
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
  }),
})

export const usePollNotamByIcaoCodes: typeof notamApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) =>
  notamApi.useGetByIcaoCodesQuery(icao, {
    pollingInterval: 3600000,
    ...options,
  })
