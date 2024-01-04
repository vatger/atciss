import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { RootState } from "../app/store"
import { selectAirportICAOs } from "./sectorApi"
import { createSelector } from "@reduxjs/toolkit"
import { createCachedSelector } from "re-reselect"

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
  return (c && c < 200) || metar.rvr.some((rvr) => rvr.low < 600)
    ? "LVP"
    : (c && c < 1500) || metar.vis.some((v) => v < 5000)
      ? "IMC"
      : "VMC"
}

export const hpaToInhg: (qnh: number) => number = (qnh) =>
  qnh * 0.02952998057228486

export const metarApi = createApi({
  reducerPath: "metar",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [id: string]: Metar }, string[]>({
      query: (icaoList) => ({
        url: "metar",
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
    getRaw: builder.query<string, string>({
      query: (icao) => ({
        url: "metar/raw",
        params: [["id", icao]],
        responseHandler: "text",
      }),
    }),
  }),
})

export const usePollMetarByIcaoCodes: typeof metarApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) =>
  metarApi.useGetByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })

export const usePollRawMetar: typeof metarApi.useGetRawQuery = (
  icao,
  options,
) => metarApi.useGetRawQuery(icao, { pollingInterval: 60000, ...options })

const selectAllMetars = createSelector(
  (state: RootState) => state,
  selectAirportICAOs,
  (state, ads) =>
    metarApi.endpoints.getByIcaoCodes.select(ads)(state)?.data ?? {},
)

export const selectMetar = createCachedSelector(
  (state: RootState) => state,
  selectAllMetars,
  (_state: RootState, icao: string) => icao,
  (state, metars, icao) =>
    metars[icao ?? ""] ??
    metarApi.endpoints.getByIcaoCodes.select([icao])(state)?.data?.[icao ?? ""],
)((_state, icao) => icao)

export const selectRawMetar = createCachedSelector(
  (state: RootState) => state,
  (_state: RootState, icao: string) => icao,
  (state, icao) => metarApi.endpoints.getRaw.select(icao)(state)?.data,
)((_state, icao) => icao)
