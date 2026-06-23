import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import L from "leaflet"
import { WindLevel } from "services/mapSlice"
import { WIND_BBOX, WIND_MODEL } from "services/windLayerConfig"

const WX_BASE_URL = "https://wx.glob.in/v1/forecast"

const speedDirectionParams = (level: WindLevel) =>
  level === "surface"
    ? {
        speed: "wind_speed_10m",
        direction: "wind_direction_10m",
      }
    : {
        speed: `wind_speed_${level}hPa`,
        direction: `wind_direction_${level}hPa`,
      }

export const buildWindGridUrl = (level: WindLevel) => {
  const { speed, direction } = speedDirectionParams(level)
  const params = new URLSearchParams({
    bounding_box: `${WIND_BBOX.latMin},${WIND_BBOX.lonMin},${WIND_BBOX.latMax},${WIND_BBOX.lonMax}`,
    models: WIND_MODEL,
    wind_speed_unit: "ms",
    hourly: `${speed},${direction}`,
    forecast_hours: "1",
  })
  return `${WX_BASE_URL}?${params.toString()}`
}

interface WindApiPoint {
  latitude: number
  longitude: number
  hourly: Record<string, (number | null)[]>
}

export interface WindGrid {
  nx: number
  ny: number
  lo1: number
  lo2: number
  la1: number
  la2: number
  dx: number
  dy: number
  speed: number[]
  direction: number[]
}

export const parseWindGrid = (
  body: WindApiPoint[],
  level: WindLevel,
): WindGrid => {
  const { speed: speedKey, direction: directionKey } =
    speedDirectionParams(level)

  const valueOf = (p: WindApiPoint, key: string) => p.hourly?.[key]?.[0] ?? 0

  const firstLat = body[0]?.latitude
  const rowLength = body.findIndex((p, i) => i > 0 && p.latitude !== firstLat)
  const cols = rowLength === -1 ? body.length : rowLength
  const rows = body.length / cols

  const apiSpeed = body.map((p) => valueOf(p, speedKey))
  const apiDirection = body.map((p) => valueOf(p, directionKey))

  return {
    nx: cols,
    ny: rows,
    lo1: body[0]?.longitude ?? WIND_BBOX.lonMin,
    lo2: body[cols - 1]?.longitude ?? WIND_BBOX.lonMax,
    la1: body[0]?.latitude ?? WIND_BBOX.latMin,
    la2: body[cols]?.latitude ?? WIND_BBOX.latMax,
    dx: cols > 1 ? body[1].longitude - body[0].longitude : 0,
    dy: rows > 1 ? body[0].latitude - body[cols].latitude : 0,
    speed: apiSpeed,
    direction: apiDirection,
  }
}

export const windToUV = (speedMs: number, directionFromDeg: number) => {
  const rad = (directionFromDeg * Math.PI) / 180
  return {
    u: -speedMs * Math.sin(rad),
    v: -speedMs * Math.cos(rad),
  }
}

export const buildVelocityData = (grid: WindGrid): L.VelocityData => {
  const refTime = new Date().toISOString()

  const baseHeader = {
    lo1: grid.lo1,
    lo2: grid.lo2,
    la1: grid.la1,
    la2: grid.la2,
    dx: grid.dx,
    dy: grid.dy,
    nx: grid.nx,
    ny: grid.ny,
    refTime,
    forecastTime: 0,
  }

  const uData: number[] = []
  const vData: number[] = []
  for (let i = 0; i < grid.speed.length; i++) {
    const { u, v } = windToUV(grid.speed[i], grid.direction[i])
    uData.push(u)
    vData.push(v)
  }

  return [
    {
      header: { ...baseHeader, parameterCategory: 2, parameterNumber: 2 },
      data: uData,
    },
    {
      header: { ...baseHeader, parameterCategory: 2, parameterNumber: 3 },
      data: vData,
    },
  ]
}

export const REFRESH_INTERVAL_MS = 30 * 60 * 1000

// Plain fetchBaseQuery (no baseUrl, no auth headers): the wind grid comes
// from a third-party host, not the backend, so it must not reuse `api`'s
// fetchWithReauth, which would attach the user's VATSIM bearer token.
export const windApi = createApi({
  reducerPath: "windApi",
  baseQuery: fetchBaseQuery(),
  endpoints: (builder) => ({
    windGrid: builder.query<L.VelocityData, WindLevel>({
      query: (level) => buildWindGridUrl(level),
      transformResponse: (body: WindApiPoint[], _meta, level) =>
        buildVelocityData(parseWindGrid(body, level)),
      keepUnusedDataFor: REFRESH_INTERVAL_MS / 1000,
    }),
  }),
})

export const { useWindGridQuery } = windApi
