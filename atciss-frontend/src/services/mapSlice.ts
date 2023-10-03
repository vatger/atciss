import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

type MapState = {
  level: number
  ofm: boolean
  dfs: boolean
  dwd: boolean
  sectors: boolean
  areas: boolean
}

const mapSlice = createSlice({
  name: "map",
  initialState: {
    level: localStorageOrDefault("map.level", 200),
    ofm: localStorageOrDefault("map.ofm", true),
    dfs: localStorageOrDefault("map.dfs", false),
    dwd: localStorageOrDefault("map.dwd", false),
    sectors: localStorageOrDefault("map.sectors", true),
    areas: localStorageOrDefault("map.areas", true),
  } as MapState,
  reducers: {
    setLevel(state, { payload: level }: PayloadAction<number>) {
      state.level = setLocalStorage("map.level", level)
    },
    setOpenFlightmaps(state, { payload: active }: PayloadAction<boolean>) {
      state.ofm = setLocalStorage("map.ofm", active)
      state.dfs = setLocalStorage("map.dfs", state.dfs && !active)
    },
    setDFS(state, { payload: active }: PayloadAction<boolean>) {
      state.dfs = setLocalStorage("map.dfs", active)
      state.ofm = setLocalStorage("map.ofm", state.ofm && !active)
    },
    setDWD(state, { payload: active }: PayloadAction<boolean>) {
      state.dwd = setLocalStorage("map.dwd", active)
    },
    setSectors(state, { payload: active }: PayloadAction<boolean>) {
      state.sectors = setLocalStorage("map.sectors", active)
    },
    setAreas(state, { payload: active }: PayloadAction<boolean>) {
      state.sectors = setLocalStorage("map.areas", active)
    },
  },
})

export const selectLevel = (store: RootState) => store.map.level
export const selectOpenFlightmaps = (store: RootState) => store.map.ofm
export const selectDFS = (store: RootState) => store.map.dfs
export const selectDWD = (store: RootState) => store.map.dwd
export const selectSectors = (store: RootState) => store.map.sectors
export const selectAreas = (store: RootState) => store.map.areas

export const {
  setLevel,
  setOpenFlightmaps,
  setDFS,
  setDWD,
  setSectors,
  setAreas,
} = mapSlice.actions
export const { reducer: mapReducer } = mapSlice
