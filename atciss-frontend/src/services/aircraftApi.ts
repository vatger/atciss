import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

export interface AircraftPerformanceData {
  id: string
  manufacturer: string
  model: string
  icao_designator?: string
  iata_designator?: string
  type: string
  engine_type?: string
  engine_count?: number
  fuel_capacity?: number
  service_ceiling?: number
  wingspan?: number
  length?: number
  height?: number
  max_speed_indicated?: number
  max_speed_mach?: number
  max_weight_taxi?: number
  max_weight_takeoff?: number
  max_weight_landing?: number
  max_weight_zerofuel?: number
  v_at?: number
  cruise_tas?: number
  cat_wtc?: string
  cat_recat?: string
  cat_app?: string
  cat_arc?: string
  remarks?: string
}

export const aircraftApi = createApi({
  reducerPath: "ac_data",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    search: builder.query<AircraftPerformanceData[], string>({
      query: (q) => ({
        url: `aircraft/search`,
        params: { query: q },
      }),
    }),
  }),
})
