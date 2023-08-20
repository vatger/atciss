import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface Weather {}

export interface Clouds {
  cover: "FEW" | "SCT" | "BKN" | "OVC"
  height: number | null
  type: string | null
}

export interface Rvr {}

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
  weather: Weather[]
  recent_weather: Weather[]
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

export const hpaToInhg: (qnh: number) => number = (qnh) => qnh * 0.02952998057228486

// const initialState: MetarState = {
//   atis: "X",
//   state: "VMC",
//   transitionLevel: 70,
//   runways: ["26L", "26R"],
//   metar: "EDDM 010820Z AUTO 25006KT 210V270 9999 SCT016 18/14 Q1013",
//   winds: "25006KT",
//   temperature: 18,
//   dewPoint: 14,
//   visibility: 9999,
//   qnh: 1013,
//   qfe: 1013 - 25.879322442072 * 1487,
//   sunrise: "0443",
//   sunset: "1743",
// }

export const metarApi = createApi({
  reducerPath: "metar",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/metar/" }),
  endpoints: (builder) => ({
    getByIcaoCode: builder.query<Metar, string>({
      query: (icao) => icao,
    }),
  }),
})

export const usePollMetarByIcaoCode: typeof metarApi.useGetByIcaoCodeQuery = (
  icao,
  options,
) =>
  metarApi.useGetByIcaoCodeQuery(icao, { pollingInterval: 60000, ...options })
