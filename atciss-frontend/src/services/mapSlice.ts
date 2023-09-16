import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"

type MapState = {
  level: number
  ofm: boolean
  dfs: boolean
  sectors: boolean
}

const mapSlice = createSlice({
  name: "map",
  initialState: {
    level: 200,
    ofm: true,
    dfs: false,
    sectors: true,
  } as MapState,
  reducers: {
    setLevel(state, { payload: level }: PayloadAction<number>) {
      state.level = level
    },
    setOpenFlightmaps(state, { payload: active }: PayloadAction<boolean>) {
      state.ofm = active
      state.dfs = state.dfs && !active
    },
    setDFS(state, { payload: active }: PayloadAction<boolean>) {
      state.dfs = active
      state.ofm = state.ofm && !active
    },
    setSectors(state, { payload: active }: PayloadAction<boolean>) {
      state.sectors = active
    },
  },
})

export const selectLevel = (store: RootState) => store.map.level
export const selectOpenFlightmaps = (store: RootState) => store.map.ofm
export const selectDFS = (store: RootState) => store.map.dfs
export const selectSectors = (store: RootState) => store.map.sectors

export const { setLevel, setOpenFlightmaps, setDFS, setSectors } =
  mapSlice.actions
export const { reducer: mapReducer } = mapSlice
