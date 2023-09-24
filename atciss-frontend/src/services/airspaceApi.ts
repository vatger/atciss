import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { LatLngExpression } from "leaflet"

export type Runway = {
  icao: string
  runway: string
}

export type Sector = {
  points: LatLngExpression[]
  min: number | null
  max: number | null
  runways: Runway[]
}

export type Airspace = {
  id: string
  remark: string
  group: string
  owner: string[]
  sectors: Sector[]
}

export type RwyDependentTopDown = {
  runway: Runway
  topdown: string[]
}

export type Airport = {
  callsign: string
  coord: LatLngExpression
  topdown: (string | RwyDependentTopDown)[]
  runways: string[]
}

export type Position = {
  pre: string[]
  type: string
  frequency: string
  callsign: string
  colours: { hex: string }[]
}

export type SectorData = {
  airspace: Airspace[]
  positions: { [indicator: string]: Position }
  airports: { [indicator: string]: Airport }
}

export const sectorApi = createApi({
  reducerPath: "sector",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByRegion: builder.query<SectorData, void>({
      query: () => ({
        url: `airspace/`,
      }),
    }),
  }),
})
