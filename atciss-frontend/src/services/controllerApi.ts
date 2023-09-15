import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

export interface Controller {
  cid: number
  name: string
  callsign: string
  frequency: string
  atis_code: string
  facility: number
  rating: number
  server: string
  visual_range: number
  logon_time: string
  last_updated: string
  text_atis: string
}

export const controllerApi = createApi({
  reducerPath: "controller",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    get: builder.query<Controller[], void>({
      query: () => ({
        url: `controller/`,
      }),
    }),
  }),
})

export const usePollControllers: typeof controllerApi.useGetQuery = (
  _,
  options,
) => controllerApi.useGetQuery(_, { pollingInterval: 60000, ...options })
