import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

export const WIND_LEVELS = [
  "surface",
  1000,
  975,
  950,
  925,
  900,
  850,
  800,
  700,
  600,
  500,
  400,
  300,
  250,
  200,
  150,
  100,
  70,
  50,
  30,
] as const

export type WindLevel = (typeof WIND_LEVELS)[number]

interface MapState {
  level: number
  ofm: boolean
  dfs: boolean
  dwd: boolean
  satellite: boolean
  lightning: boolean
  sectors: boolean
  areas: boolean
  areas_dfs: boolean
  areas_vlara: boolean
  loa: boolean
  sigmet: boolean
  search: string
  selectedAirway: string | null
  airway: boolean
  airwayLowerUpper: "LOWER" | "UPPER"
  wind: boolean
  windLevel: WindLevel
}

const queryParams = new URLSearchParams(window.location.search)

const mapSlice = createSlice({
  name: "map",
  initialState: {
    level: queryParams.get("level") ?? localStorageOrDefault("map.level", 200),
    ofm: localStorageOrDefault("map.ofm", true),
    dfs: localStorageOrDefault("map.dfs", false),
    dwd: localStorageOrDefault("map.dwd", false),
    satellite: localStorageOrDefault("map.satellite", false),
    lightning: localStorageOrDefault("map.lightning", false),
    sectors:
      queryParams.has("pos") || localStorageOrDefault("map.sectors", true),
    sigmet: localStorageOrDefault("map.sigmet", false),
    areas: localStorageOrDefault("map.areas", true),
    areas_dfs: localStorageOrDefault("map.areas.dfs", false),
    areas_vlara: localStorageOrDefault("map.area.vlara", true),
    loa: localStorageOrDefault("map.loa", false),
    search: "",
    selectedAirway: null,
    airway: localStorageOrDefault("map.airway", false),
    airwayLowerUpper: localStorageOrDefault("map.airwayLowerUpper", "LOWER"),
    wind: localStorageOrDefault("map.wind", false),
    windLevel: localStorageOrDefault<WindLevel>("map.windLevel", "surface"),
  } as MapState,
  reducers: {
    setLevel(state, { payload: level }: PayloadAction<number>) {
      state.level = setLocalStorage("map.level", level)
    },
    setOpenFlightmaps(state, { payload: active }: PayloadAction<boolean>) {
      state.ofm = setLocalStorage("map.ofm", active)
      state.dfs = setLocalStorage("map.dfs", state.dfs && !active)
      state.satellite = setLocalStorage(
        "map.satellite",
        state.satellite && !active,
      )
    },
    setDFS(state, { payload: active }: PayloadAction<boolean>) {
      state.dfs = setLocalStorage("map.dfs", active)
      state.ofm = setLocalStorage("map.ofm", state.ofm && !active)
      state.satellite = setLocalStorage(
        "map.satellite",
        state.satellite && !active,
      )
      if (active) state.wind = setLocalStorage("map.wind", false)
    },
    setDWD(state, { payload: active }: PayloadAction<boolean>) {
      state.dwd = setLocalStorage("map.dwd", active)
    },
    setSatellite(state, { payload: active }: PayloadAction<boolean>) {
      state.satellite = setLocalStorage("map.satellite", active)
      state.ofm = setLocalStorage("map.ofm", state.ofm && !active)
      state.dfs = setLocalStorage("map.dfs", state.dfs && !active)
      if (active) state.wind = setLocalStorage("map.wind", false)
    },
    setLightning(state, { payload: active }: PayloadAction<boolean>) {
      state.lightning = setLocalStorage("map.lightning", active)
    },
    setSectors(state, { payload: active }: PayloadAction<boolean>) {
      state.sectors = setLocalStorage("map.sectors", active)
    },
    setAreas(state, { payload: active }: PayloadAction<boolean>) {
      state.areas = setLocalStorage("map.areas", active)
    },
    setAreasDFS(state, { payload: active }: PayloadAction<boolean>) {
      state.areas_dfs = setLocalStorage("map.areas.dfs", active)
    },
    setAreasVLARA(state, { payload: active }: PayloadAction<boolean>) {
      state.areas_vlara = setLocalStorage("map.areas.vlara", active)
    },
    setSigmet(state, { payload: active }: PayloadAction<boolean>) {
      state.sigmet = setLocalStorage("map.sigmet", active)
    },
    setLoa(state, { payload: active }: PayloadAction<boolean>) {
      state.loa = setLocalStorage("map.loa", active)
    },
    setSearch(state, { payload: search }: PayloadAction<string>) {
      state.search = search
    },
    setSelectedAirway(
      state,
      { payload: airway }: PayloadAction<string | null>,
    ) {
      state.selectedAirway = airway
    },
    setAirwayOnMap(state, { payload: active }: PayloadAction<boolean>) {
      state.airway = setLocalStorage("map.airway", active)
    },
    setAirwayLowerUpper(
      state,
      { payload: lowerUpper }: PayloadAction<"LOWER" | "UPPER">,
    ) {
      state.airwayLowerUpper = setLocalStorage(
        "map.airwayLowerUpper",
        lowerUpper,
      )
    },
    setWind(state, { payload: active }: PayloadAction<boolean>) {
      state.wind = setLocalStorage("map.wind", active)
      // Wind is mutually exclusive with the SAT/ICAO basemaps: those tile
      // sets aren't a good backdrop for the particle field, so fall back to
      // OFM (a light, mostly-empty basemap) when wind is turned on.
      if (active && (state.dfs || state.satellite)) {
        state.dfs = setLocalStorage("map.dfs", false)
        state.satellite = setLocalStorage("map.satellite", false)
        state.ofm = setLocalStorage("map.ofm", true)
      }
    },
    setWindLevel(state, { payload: level }: PayloadAction<WindLevel>) {
      state.windLevel = setLocalStorage("map.windLevel", level)
    },
  },
})

export const selectLevel = (store: RootState) => store.map.level
export const selectOpenFlightmapsOnMap = (store: RootState) => store.map.ofm
export const selectDFSOnMap = (store: RootState) => store.map.dfs
export const selectDWDOnMap = (store: RootState) => store.map.dwd
export const selectSatelliteOnMap = (store: RootState) => store.map.satellite
export const selectLightning = (store: RootState) => store.map.lightning
export const selectSectorsOnMap = (store: RootState) => store.map.sectors
export const selectAreasOnMap = (store: RootState) => store.map.areas
export const selectAreasDFSOnMap = (store: RootState) => store.map.areas_dfs
export const selectAreasVLARAOnMap = (store: RootState) => store.map.areas_vlara
export const selectLoaOnMap = (store: RootState) => store.map.loa
export const selectSigmetOnMap = (store: RootState) => store.map.sigmet
export const selectSearch = (store: RootState) => store.map.search
export const selectAirwayOnMap = (store: RootState) => store.map.airway
export const selectSelectedAirway = (store: RootState) =>
  store.map.selectedAirway
export const selectAirwayLowerUpper = (store: RootState) =>
  store.map.airwayLowerUpper
export const selectWindOnMap = (store: RootState) => store.map.wind
export const selectWindLevel = (store: RootState) => store.map.windLevel

export const {
  setLevel,
  setOpenFlightmaps,
  setDFS,
  setDWD,
  setSatellite,
  setLightning,
  setSectors,
  setAreas,
  setAreasDFS,
  setAreasVLARA,
  setLoa,
  setSigmet,
  setSearch,
  setAirwayOnMap,
  setAirwayLowerUpper,
  setSelectedAirway,
  setWind,
  setWindLevel,
} = mapSlice.actions
export const { reducer: mapReducer } = mapSlice
