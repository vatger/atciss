import { WindLevel } from "services/mapSlice"

// ICAO/ISA standard-atmosphere troposphere formula (pressure -> altitude)
// https://en.wikipedia.org/wiki/Pressure_altitude
export const pressureToFlightLevelFt = (hpa: number) =>
  145366.45 * (1 - Math.pow(hpa / 1013.25, 0.190284))

export const windLevelLabel = (level: WindLevel) => {
  if (level === "surface") return "Surface"
  const ft = pressureToFlightLevelFt(level)
  if (ft < 9000) {
    const roundedFt = Math.round(ft / 100) * 100
    return `${roundedFt}ft`
  }
  const fl = Math.round(ft / 1000) * 10
  return `FL${fl}`
}
