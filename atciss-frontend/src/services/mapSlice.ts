import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

type MapState = {
  level: number
  ofm: boolean
  dfs: boolean
  dwd: boolean
  satellite: boolean
  sectors: boolean
  areas: boolean
  loa: boolean
  search: string
}

const mapSlice = createSlice({
  name: "map",
  initialState: {
    level: localStorageOrDefault("map.level", 200),
    ofm: localStorageOrDefault("map.ofm", true),
    dfs: localStorageOrDefault("map.dfs", false),
    dwd: localStorageOrDefault("map.dwd", false),
    satellite: localStorageOrDefault("map.satellite", false),
    sectors: localStorageOrDefault("map.sectors", true),
    areas: localStorageOrDefault("map.areas", true),
    loa: localStorageOrDefault("map.loa", false),
    search: "",
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
    setSectors(state, { payload: active }: PayloadAction<boolean>) {
      state.sectors = setLocalStorage("map.sectors", active)
    },
    setAreas(state, { payload: active }: PayloadAction<boolean>) {
      state.areas = setLocalStorage("map.areas", active)
    },
    setLoa(state, { payload: active }: PayloadAction<boolean>) {
      state.loa = setLocalStorage("map.loa", active)
    },
    setSearch(state, { payload: search }: PayloadAction<string>) {
      state.search = search
    },
  },
})

export const selectLevel = (store: RootState) => store.map.level
export const selectOpenFlightmapsOnMap = (store: RootState) => store.map.ofm
export const selectDFSOnMap = (store: RootState) => store.map.dfs
export const selectDWDOnMap = (store: RootState) => store.map.dwd
export const selectSatelliteOnMap = (store: RootState) => store.map.satellite
export const selectSectorsOnMap = (store: RootState) => store.map.sectors
export const selectAreasOnMap = (store: RootState) => store.map.areas
export const selectLoaOnMap = (store: RootState) => store.map.loa
export const selectSearch = (store: RootState) => store.map.search

export const {
  setLevel,
  setOpenFlightmaps,
  setDFS,
  setDWD,
  setSatellite,
  setSectors,
  setAreas,
  setLoa,
  setSearch,
} = mapSlice.actions
export const { reducer: mapReducer } = mapSlice
