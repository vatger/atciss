import { beforeEach, describe, expect, it } from "vitest"

import {
  mapReducer,
  selectWindLevel,
  selectWindOnMap,
  setDFS,
  setSatellite,
  setWind,
  setWindLevel,
} from "./mapSlice"

describe("wind state", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("setWind updates state and persists to localStorage", () => {
    const state = mapReducer(undefined, setWind(true))
    expect(state.wind).toBe(true)
    expect(JSON.parse(localStorage.getItem("map.wind") ?? "null")).toBe(true)
  })

  it("setWindLevel updates state and persists to localStorage", () => {
    const state = mapReducer(undefined, setWindLevel(500))
    expect(state.windLevel).toBe(500)
    expect(JSON.parse(localStorage.getItem("map.windLevel") ?? "null")).toBe(
      500,
    )
  })

  it("selectWindOnMap/selectWindLevel read back the right slice of state", () => {
    const state = mapReducer(undefined, setWind(true))
    expect(selectWindOnMap({ map: state } as never)).toBe(true)
    expect(selectWindLevel({ map: state } as never)).toBe("surface")
  })
})

describe("wind/basemap mutual exclusivity", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("turning on wind while SAT is active forces OFM and disables SAT", () => {
    const withSatellite = mapReducer(undefined, setSatellite(true))
    expect(withSatellite.satellite).toBe(true)

    const state = mapReducer(withSatellite, setWind(true))
    expect(state.wind).toBe(true)
    expect(state.satellite).toBe(false)
    expect(state.ofm).toBe(true)
  })

  it("turning on wind while ICAO (DFS) is active forces OFM and disables DFS", () => {
    const withDfs = mapReducer(undefined, setDFS(true))
    expect(withDfs.dfs).toBe(true)

    const state = mapReducer(withDfs, setWind(true))
    expect(state.wind).toBe(true)
    expect(state.dfs).toBe(false)
    expect(state.ofm).toBe(true)
  })

  it("turning on wind while OFM is already active leaves basemap untouched", () => {
    const withWind = mapReducer(undefined, setWind(true))
    expect(withWind.wind).toBe(true)
    expect(withWind.ofm).toBe(true)
    expect(withWind.dfs).toBe(false)
    expect(withWind.satellite).toBe(false)
  })

  it("turning on SAT while wind is active disables wind", () => {
    const withWind = mapReducer(undefined, setWind(true))
    const state = mapReducer(withWind, setSatellite(true))
    expect(state.satellite).toBe(true)
    expect(state.wind).toBe(false)
  })

  it("turning on ICAO (DFS) while wind is active disables wind", () => {
    const withWind = mapReducer(undefined, setWind(true))
    const state = mapReducer(withWind, setDFS(true))
    expect(state.dfs).toBe(true)
    expect(state.wind).toBe(false)
  })
})
