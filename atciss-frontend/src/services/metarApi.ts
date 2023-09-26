import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

export interface Clouds {
  cover: "FEW" | "SCT" | "BKN" | "OVC"
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
  wind_dir: number | null
  wind_speed: number
  wind_gust: number | null
  wind_dir_from: number | null
  wind_dir_to: number | null
  vis: number
  temp: number
  dewpt: number
  qnh: number
  rvr: Rvr[]
  weather: string[]
  recent_weather: string[]
  clouds: Clouds[]
  trend: string
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

export const xmc: (metar: Metar) => "VMC" | "IMC" = (metar) => {
  const c = ceiling(metar)
  return (c && c < 1500) || metar.vis < 5000 ? "IMC" : "VMC"
}

export const tl: (metar: Metar) => number = (metar) => {
  if (metar.qnh < 978) {
    return 80
  } else if (metar.qnh < 1014) {
    return 70
  } else if (metar.qnh < 1051) {
    return 60
  } else {
    return 50
  }
}

export const hpaToInhg: (qnh: number) => number = (qnh) =>
  qnh * 0.02952998057228486

export const metarApi = createApi({
  reducerPath: "metar",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByIcaoCodes: builder.query<{ [id: string]: Metar }, string[]>({
      query: (icaoList) => ({
        url: `metar`,
        params: icaoList.map((icao) => ["icao", icao]),
      }),
    }),
  }),
})

export const usePollMetarByIcaoCodes: typeof metarApi.useGetByIcaoCodesQuery = (
  icao,
  options,
) =>
  metarApi.useGetByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })
