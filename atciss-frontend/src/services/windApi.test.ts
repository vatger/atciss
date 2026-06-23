import { configureStore } from "@reduxjs/toolkit"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  buildVelocityData,
  buildWindGridUrl,
  parseWindGrid,
  windApi,
  windToUV,
} from "./windApi"

describe("windToUV", () => {
  it("converts wind from north", () => {
    expect(windToUV(10, 0).u).toBeCloseTo(0)
    expect(windToUV(10, 0).v).toBeCloseTo(-10)
  })

  it("converts wind from east", () => {
    expect(windToUV(10, 90).u).toBeCloseTo(-10)
    expect(windToUV(10, 90).v).toBeCloseTo(0)
  })

  it("converts wind from south", () => {
    expect(windToUV(10, 180).u).toBeCloseTo(0)
    expect(windToUV(10, 180).v).toBeCloseTo(10)
  })

  it("converts wind from west", () => {
    expect(windToUV(10, 270).u).toBeCloseTo(10)
    expect(windToUV(10, 270).v).toBeCloseTo(0)
  })

  it("returns zero vector for zero speed regardless of direction", () => {
    const { u, v } = windToUV(0, 123)
    expect(u).toBeCloseTo(0)
    expect(v).toBeCloseTo(0)
  })
})

describe("buildWindGridUrl", () => {
  it("builds an hourly= query with forecast_hours=1", () => {
    const url = buildWindGridUrl(500)
    const params = new URL(url).searchParams
    expect(params.get("hourly")).toBe("wind_speed_500hPa,wind_direction_500hPa")
    expect(params.get("forecast_hours")).toBe("1")
  })
})

// 2 rows x 3 cols, south->north then west->east, as the API returns it.
const southToNorthBody = [
  {
    latitude: 50,
    longitude: 5,
    hourly: { wind_speed_10m: [1], wind_direction_10m: [0] },
  },
  {
    latitude: 50,
    longitude: 6,
    hourly: { wind_speed_10m: [2], wind_direction_10m: [0] },
  },
  {
    latitude: 50,
    longitude: 7,
    hourly: { wind_speed_10m: [3], wind_direction_10m: [0] },
  },
  {
    latitude: 51,
    longitude: 5,
    hourly: { wind_speed_10m: [4], wind_direction_10m: [0] },
  },
  {
    latitude: 51,
    longitude: 6,
    hourly: { wind_speed_10m: [5], wind_direction_10m: [0] },
  },
  {
    latitude: 51,
    longitude: 7,
    hourly: { wind_speed_10m: [6], wind_direction_10m: [0] },
  },
]

describe("parseWindGrid", () => {
  it("created data grid for for leaflet-velocity", () => {
    const grid = parseWindGrid(southToNorthBody, "surface")

    expect(grid.nx).toBe(3)
    expect(grid.ny).toBe(2)
    expect(grid.lo1).toBe(5)
    expect(grid.lo2).toBe(7)
    expect(grid.la1).toBe(50)
    expect(grid.la2).toBe(51)
    expect(grid.dx).toBe(1)
    expect(grid.dy).toBe(-1)
    expect(grid.speed).toEqual([1, 2, 3, 4, 5, 6])
  })

  it("coerces null hourly speed/direction to 0", () => {
    const body = [
      {
        latitude: 50,
        longitude: 5,
        hourly: { wind_speed_500hPa: [null], wind_direction_500hPa: [null] },
      },
      {
        latitude: 50,
        longitude: 6,
        hourly: { wind_speed_500hPa: [12], wind_direction_500hPa: [200] },
      },
    ]

    const grid = parseWindGrid(body, 500)

    expect(grid.speed).toEqual([0, 12])
    expect(grid.direction).toEqual([0, 200])
  })
})

describe("windApi windGrid endpoint", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches the wind grid URL and transforms the response into velocity data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve(southToNorthBody),
        text: () => Promise.resolve(JSON.stringify(southToNorthBody)),
        clone() {
          return this
        },
      }),
    )

    const store = configureStore({
      reducer: { [windApi.reducerPath]: windApi.reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(windApi.middleware),
    })

    const result = await store.dispatch(
      windApi.endpoints.windGrid.initiate("surface"),
    )

    const expected = buildVelocityData(
      parseWindGrid(southToNorthBody, "surface"),
    )
    const [uComponent, vComponent] = result.data ?? []
    expect(uComponent?.header.nx).toBe(expected[0].header.nx)
    expect(uComponent?.data).toEqual(expected[0].data)
    expect(vComponent?.data).toEqual(expected[1].data)
    const requestArg = vi.mocked(fetch).mock.calls[0][0] as Request
    expect(requestArg.url).toBe(buildWindGridUrl("surface"))
  })
})

describe("buildVelocityData", () => {
  it("encodes grid config into both headers and converts speed/direction in order", () => {
    const grid = {
      nx: 2,
      ny: 2,
      lo1: 5,
      lo2: 6,
      la1: 51,
      la2: 52,
      dx: 1,
      dy: 1,
      speed: [10, 20, 30, 40],
      direction: [0, 90, 180, 270],
    }

    const [uComponent, vComponent] = buildVelocityData(grid)

    expect(uComponent.header.nx).toBe(2)
    expect(uComponent.header.ny).toBe(2)
    expect(uComponent.header.lo1).toBe(5)
    expect(uComponent.header.la1).toBe(51)
    expect(uComponent.header.parameterCategory).toBe(2)
    expect(uComponent.header.parameterNumber).toBe(2)
    expect(vComponent.header.parameterNumber).toBe(3)

    expect(uComponent.data).toHaveLength(4)
    expect(vComponent.data).toHaveLength(4)

    grid.speed.forEach((speed, i) => {
      const { u, v } = windToUV(speed, grid.direction[i])
      expect(uComponent.data[i]).toBeCloseTo(u)
      expect(vComponent.data[i]).toBeCloseTo(v)
    })
  })
})
