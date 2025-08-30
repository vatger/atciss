import { LatLngTuple } from "leaflet"

export interface AreaBooking {
  name: string
  source: string
  polygon: LatLngTuple[]
  lower_limit: number
  upper_limit: number
  start: string
  end: string
  reservation_id?: string
  creator?: number
  callsigns?: string[]
  booking_type?: string
  agency?: string
  permeability?: string
  activity_type?: string
  nbr_acft?: number
  priority?: number
  remarks?: string
  status?: string
}
