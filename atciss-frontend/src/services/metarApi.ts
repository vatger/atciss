import { createSelector } from "@reduxjs/toolkit"
import { selectAirportICAOs } from "services/aerodrome"
import { api } from "services/api"
import { RootState } from "../app/store"
import { Metar, Clouds } from "types/wx"

export const ceiling: (metar: Metar) => number | null = (metar) =>
  metar.clouds.reduce((acc: number | null, clouds: Clouds) => {
    if (clouds.height && ["BKN", "OVC"].includes(clouds.cover)) {
      if (!acc) {
        return clouds.height
      } else {
        return clouds.height < acc ? clouds.height : acc
      }
    } else {
      return acc
    }
  }, null)

export const xmc: (metar: Metar) => "VMC" | "IMC" | "LVP" = (metar) => {
  const c = ceiling(metar)
  return (c && c < 200) || metar.rvr.some((rvr) => rvr.low <= 600)
    ? "LVP"
    : (c && c < 1500) || metar.vis.some((v) => v < 5000)
      ? "IMC"
      : "VMC"
}

export const hpaToInhg: (qnh: number | null) => number | null = (qnh) =>
  qnh ? qnh * 0.02952998057228486 : null

export const usePollMetarByIcaoCodes: typeof api.useMetarsByIcaoCodesQuery = (
  icao,
  options,
) =>
  api.useMetarsByIcaoCodesQuery(icao, {
    pollingInterval: 60000,
    ...options,
  })

export const usePollRawMetar: typeof api.useRawMetarQuery = (icao, options) =>
  api.useRawMetarQuery(icao, { pollingInterval: 60000, ...options })

const selectByIcaoCodes = createSelector(
  selectAirportICAOs,
  api.endpoints.metarsByIcaoCodes.select,
)
const selectAllMetars = createSelector(
  (state: RootState) => state,
  selectByIcaoCodes,
  (state, selector) => selector(state)?.data ?? {},
)

export const selectMetar = createSelector(
  (state: RootState) => state,
  selectAllMetars,
  (_state: RootState, icao: string) => icao,
  (state, metars, icao) =>
    metars[icao ?? ""] ??
    api.endpoints.metarsByIcaoCodes.select([icao])(state)?.data?.[icao ?? ""],
)

export const selectRawMetar = createSelector(
  (state: RootState) => state,
  (_state: RootState, icao: string) => icao,
  (state, icao) => api.endpoints.rawMetar.select(icao)(state)?.data,
)
