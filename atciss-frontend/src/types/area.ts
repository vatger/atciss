import { LatLngTuple } from "leaflet"

export interface AreaBooking {
  name: string
  polygon: LatLngTuple[]
  lower_limit: number
  upper_limit: number
  start_datetime: string
  end_datetime: string
}
