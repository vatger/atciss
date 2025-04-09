import { LatLngTuple } from "leaflet"

export interface Clouds {
  cover: "FEW" | "SCT" | "BKN" | "OVC" | "NSC"
  height: number | null
  type: string | null
}

export interface Rvr {
  runway: string
  low: number
  high: number | null
  trend: string | null
}

export interface MetarTuple {
  current: Metar
  previous: Metar
}

export interface Metar {
  raw: string
  station_id: string
  time: string
  automatic: boolean
  wind_dir: number | null
  wind_speed: number
  wind_gust: number | null
  wind_dir_from: number | null
  wind_dir_to: number | null
  vis: number[]
  temp: number
  dewpt: number
  qnh: number
  rvr: Rvr[]
  weather: string[]
  recent_weather: string[]
  clouds: Clouds[]
  trend: string
  tl: number | null
}

export interface Sigmet {
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
