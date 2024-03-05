import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"
import { selectDfsAd } from "services/aerodrome"
import { selectAtis } from "services/atisApi"
import { Runway } from "types/dfs"

type ConfigState = {
  activeAerodrome: string
}

const idvsSlice = createSlice({
  name: "idvs",
  initialState: {
    activeAerodrome: localStorageOrDefault("idvs.activeAerodrome", "EDDM"),
  } as ConfigState,
  reducers: {
    setActiveAerodrome(state, { payload }: PayloadAction<string>) {
      state.activeAerodrome = setLocalStorage("idvs.activeAerodrome", payload)
    },
  },
})

export const selectActiveAerodrome = (store: RootState) =>
  store.idvs.activeAerodrome

export const selectRunways = createSelector(
  (store) => store,
  selectActiveAerodrome,
  (store, ad) => {
    const aerodrome = selectDfsAd(store, ad)

    return (
      aerodrome?.runways?.filter((rwy) => !rwy.designator.match(/G|Y/)) ?? []
    )
  },
)

export const selectRunwayDirection = createSelector(
  (store) => store,
  selectRunways,
  selectActiveAerodrome,
  (_store, idx) => idx,
  (store, runways, ad, idx) => {
    const atis = selectAtis(store, ad)

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

export const { setActiveAerodrome } = idvsSlice.actions
export const { reducer: idvsReducer } = idvsSlice
