export interface Atis {
  cid: string
  name: string
  callsign: string
  frequency: string
  atis_code: string
  text_atis: string
  runways_in_use: string[]
}

export interface Traffic {
  callsign: string
  departure_icao: string
  departure: string
  destination_icao: string
  destination: string
  ac_type: string
  groundspeed: number
  eta?: string
}

export interface AerodromeTraffic {
  aerodrome: string
  arrivals: Traffic[]
  departures: Traffic[]
}

export interface Controller {
  cid: string
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
