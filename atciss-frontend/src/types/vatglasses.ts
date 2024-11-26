import { LatLngExpression } from "leaflet"

export interface Runway {
  icao: string
  runway: string | string[]
}

export interface Sector {
  points: LatLngExpression[]
  min: number | null
  max: number | null
  runways: Runway[]
}

export interface Airspace {
  id: string
  uid: string | null
  remark: string | null
  group: string
  owner: string[]
  sectors: Sector[]
}

export interface RwyDependentTopDown {
  runway: Runway
  topdown: string[]
}

export interface Airport {
  callsign: string
  coord: LatLngExpression
  topdown: (string | RwyDependentTopDown)[]
  runways: string[]
}

export interface Position {
  id: string
  name: string
  pre: string[]
  type: string
  frequency: string
  callsign: string
  colours: { hex: string }[]
}

export interface SectorData {
  airspace: Record<string, Airspace>
  positions: Record<string, Position>
  airports: Record<string, Airport>
}
