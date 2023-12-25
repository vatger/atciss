import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { createSelector } from "@reduxjs/toolkit"
import { selectUser } from "../app/auth/slice"

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
        url: `vatsim/controllers`,
      }),
    }),
  }),
})

export const usePollControllers: typeof controllerApi.useGetQuery = (
  _,
  options,
) => controllerApi.useGetQuery(_, { pollingInterval: 60000, ...options })

export const selectControllers = createSelector(
  controllerApi.endpoints.get.select(),
  (response) => response.data ?? [],
)

export const selectMe = createSelector(
  selectControllers,
  selectUser,
  (controllers, user) =>
    controllers.find((c) => c.cid.toString() === user?.cid),
)
