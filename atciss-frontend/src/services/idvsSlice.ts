import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"
import { selectDfsAd } from "services/aerodrome"
import { selectAtis } from "services/atisApi"

interface ConfigState {
  activeAerodrome: string
  atisRwyConfigOpen: boolean
}

const idvsSlice = createSlice({
  name: "idvs",
  initialState: {
    activeAerodrome: localStorageOrDefault("idvs.activeAerodrome", "EDDM"),
    atisRwyConfigOpen: false,
  } as ConfigState,
  reducers: {
    setActiveAerodrome(state, { payload }: PayloadAction<string>) {
      state.activeAerodrome = setLocalStorage("idvs.activeAerodrome", payload)
    },
    setAtisRwyConfigOpen(state, { payload }: PayloadAction<boolean>) {
      state.atisRwyConfigOpen = payload
    },
  },
})

export const selectActiveAerodrome = (store: RootState) =>
  store.idvs.activeAerodrome

export const selectAtisRwyConfigOpen = (store: RootState) =>
  store.idvs.atisRwyConfigOpen

export const selectRunwayDirection = createSelector(
  (store) => store,
  selectActiveAerodrome,
  (_store, idx) => idx,
  (store, ad, idx) => {
    const aerodrome = selectDfsAd(store, ad)
    const atis = selectAtis(store, ad)

    const runways =
      aerodrome?.runways?.filter((rwy) => !rwy.designator.match(/G|Y/)) ?? []

    if (runways.length > 1 && atis?.runways_in_use) {
      const rwy = atis?.runways_in_use[idx]
      return runways
        .flatMap((rwy) => rwy.directions)
        .find((dir) => dir.designator === rwy)
    } else if (runways.length > 1) {
      return runways[idx]?.directions?.[0]
    } else {
      return runways[0]?.directions?.[idx]
    }
  },
)

export const { setActiveAerodrome, setAtisRwyConfigOpen } = idvsSlice.actions
export const { reducer: idvsReducer } = idvsSlice
