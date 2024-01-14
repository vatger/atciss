import { LatLngExpression } from "leaflet"

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
  uid: string | null
  remark: string | null
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
