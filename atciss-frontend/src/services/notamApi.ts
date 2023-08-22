import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { DateTime } from "luxon"

type NotamIn = Omit<Notam, "valid_from" | "valid_till" | "created"> & {
  valid_from: string
  valid_till: string
  created: string | null
}

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
  valid_from: DateTime
  valid_till: DateTime
  schedule: string | null
  body: string
  limit_lower: string | null
  limit_upper: string | null
  source: string | null
  created: DateTime | null
}

export const notamApi = createApi({
  reducerPath: "notam",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/notam/" }),
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [icao: string]: Notam[] }, string[]>({
      query: (icaoList) => ({
        url: "",
        params: icaoList.map((icao) => ["icao", icao]),
      }),
      transformResponse: (notamData: { [icao: string]: NotamIn[] }) => {
        return Object.entries(notamData).reduce(
          (notamsPerIcao, [icao, notams]) => {
            notamsPerIcao[icao] = notams.map((notam) => ({
              ...notam,
              valid_till: DateTime.fromISO(notam.valid_till).toUTC(),
              valid_from: DateTime.fromISO(notam.valid_from).toUTC(),
              created: notam.created
                ? DateTime.fromISO(notam.created).toUTC()
                : null,
            }))
            return notamsPerIcao
          },
          {} as { [icao: string]: Notam[] },
        )
      },
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
