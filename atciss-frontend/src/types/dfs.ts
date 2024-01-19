import { LatLngExpression, LatLngTuple } from "leaflet"

export interface Runway {
  id: string
  aerodrome_id: string
  designator: string
  length: number | null
  width: number | null
  surface: string | null
  directions: RunwayDirection[]
}

export interface RunwayDirection {
  id: string
  runway_id: string
  designator: string
  true_bearing: number | null
  magnetic_bearing: number | null
  guidance: string | null
}

export interface Aerodrome {
  id: string
  name: string | null
  type: "AD" | "HP"
  local_designator: string | null
  iata_designator: string | null
  icao_designator: string | null
  arp_location: LatLngTuple
  elevation: number | null
  arp_elevation: number | null
  mag_variation: number | null
  ifr: boolean | null
  sunrise: string
  sunset: string
  runways: Runway[]
}

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

export interface Navaid {
  id: string
  designator: string
  name: string
  type: string
  location: LatLngExpression
  channel?: string
  frequency?: number
  aerodrome_id?: string
  remark?: string
  operation_remark?: string
}
