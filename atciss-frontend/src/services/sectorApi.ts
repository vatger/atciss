import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { LatLngExpression } from "leaflet"
import { createSelector } from "@reduxjs/toolkit"
import { createCachedSelector } from "re-reselect"
import { RootState } from "../app/store"
import { selectFirAllAerodromes } from "./configSlice"

export type Runway = {
  icao: string
  runway: string | string[]
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
  id: string
  name: string
  pre: string[]
  type: string
  frequency: string
  callsign: string
  colours: { hex: string }[]
}

export type SectorData = {
  airspace: { [indicator: string]: Airspace }
  positions: { [indicator: string]: Position }
  airports: { [indicator: string]: Airport }
}

export const sectorApi = createApi({
  reducerPath: "sector",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    get: builder.query<SectorData, void>({
      query: () => ({
        url: `airspace/`,
      }),
    }),
  }),
})

const selectSectorData = sectorApi.endpoints.get.select()

export const selectPositions = createSelector(
  selectSectorData,
  (sectorDataResponse) =>
    Object.fromEntries(
      Object.entries(sectorDataResponse.data?.positions ?? {}),
    ),
)

export const selectPosition = createCachedSelector(
  selectPositions,
  (_state: RootState, id: string | null) => id,
  (positions, id): Position | null => positions[id ?? ""] ?? null,
)((_state, id) => id ?? "invalid")

const emptyAirspaces: { [indicator: string]: Airspace } = {}
export const selectAirspace = createSelector(
  selectSectorData,
  (sectorDataResponse) => sectorDataResponse.data?.airspace ?? emptyAirspaces,
)
export const selectSectorIDs = createSelector(selectAirspace, (airspace) =>
  Object.keys(airspace),
)
export const selectSector = createCachedSelector(
  selectAirspace,
  (_state: RootState, id: string) => id,
  (airspace, id) => airspace[id ?? ""],
)((_state, id) => id)

const emptyAirports: { [indicator: string]: Airport } = {}
export const selectAirports = createSelector(
  selectSectorData,
  (sectorDataResponse) => sectorDataResponse.data?.airports ?? emptyAirports,
)
const selectVatglassesAirportICAOs = createSelector(
  selectAirports,
  (airports) => Object.keys(airports),
)
export const selectAirport = createCachedSelector(
  selectAirports,
  (_state: RootState, id: string) => id,
  (airports, icao) => airports[icao ?? ""],
)((_state, icao) => icao)

export const selectAirportICAOs = createSelector(
  selectVatglassesAirportICAOs,
  selectFirAllAerodromes,
  (vatglassesAds, firAds) => [...new Set([...vatglassesAds, ...firAds])],
)
