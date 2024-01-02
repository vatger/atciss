import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { LatLngTuple } from "leaflet"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { selectActiveFir, selectNeighbourFirs } from "./configSlice"

export type Sigmet = {
  isigmetId: number
  icaoId: string
  firId: string
  receiptTime: string
  validTimeFrom: string
  validTimeTo: string
  seriesId: string
  hazard: string
  qualifier: string
  base: number | null
  top: number | null
  geom: string
  dir: string | null
  spd: number | null
  chng: string | null
  coords: LatLngTuple[]
  rawSigmet: string
}

export const sigmetApi = createApi({
  reducerPath: "sigmet",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    get: builder.query<Sigmet[], string[]>({
      query: (firs) => ({
        url: "sigmet",
        params: firs.map((fir) => ["fir", fir]),
      }),
    }),
  }),
})

export const usePollSigmet: typeof sigmetApi.useGetQuery = (_, options) =>
  sigmetApi.useGetQuery(_, { pollingInterval: 60000, ...options })

export const selectSigmets = createSelector(
  (state: RootState) => state,
  selectActiveFir,
  selectNeighbourFirs,
  (state, fir, firs) =>
    sigmetApi.endpoints.get.select([fir, ...firs])(state)?.data ?? [],
)
