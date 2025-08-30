import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

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
    },
    setDWD(state, { payload: active }: PayloadAction<boolean>) {
      state.dwd = setLocalStorage("map.dwd", active)
    },
    setSatellite(state, { payload: active }: PayloadAction<boolean>) {
      state.satellite = setLocalStorage("map.satellite", active)
      state.ofm = setLocalStorage("map.ofm", state.ofm && !active)
      state.dfs = setLocalStorage("map.dfs", state.dfs && !active)
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
} = mapSlice.actions
export const { reducer: mapReducer } = mapSlice
