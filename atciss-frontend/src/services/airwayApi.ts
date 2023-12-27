import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { RootState } from "../app/store"
import { createSelector } from "@reduxjs/toolkit"
import { LatLngExpression } from "leaflet"
import { selectAirwayLowerUpper } from "./mapSlice"
import { Navaid } from "./navaidApi"

export interface Airway {
  id: string
  designatorPrefix: string | null
  designatorSecondLetter: string | null
  designatorNumber: string | null
  locationDesignator: string | null
}

export interface AirwaySegment {
  id: string
  level: string
  true_track: number | null
  reverse_true_track: number | null
  length: number
  upper_limit: number
  upper_limit_uom: "FL" | "FT"
  lower_limit: number
  lower_limit_uom: "FL" | "FT"
  start_id: string
  end_id: string
  airway_id: string
  curve_extent: LatLngExpression[]

  start: Navaid
  end: Navaid
  airway: Airway
}

export const airwayApi = createApi({
  reducerPath: "airway",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    get: builder.query<AirwaySegment[], "LOWER" | "UPPER">({
      query: (hiLo) => ({
        url: `airway/${hiLo}`,
      }),
    }),
  }),
})

export const selectAirways = createSelector(
  (state: RootState) => state,
  selectAirwayLowerUpper,
  (state, hiLo) => airwayApi.endpoints.get.select(hiLo)(state)?.data ?? [],
)
