import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { FIR_SETTINGS } from "../app/config"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

type ConfigState = {
  activeFir: string
}

const configSlice = createSlice({
  name: "config",
  initialState: {
    activeFir: localStorageOrDefault(
      "config.activeFir",
      Object.keys(FIR_SETTINGS).shift(),
    ),
  } as ConfigState,
  reducers: {
    setActiveFir(state, { payload }: PayloadAction<string>) {
      state.activeFir = setLocalStorage("config.activeFir", payload)
    },
  },
})

export const selectActiveFir = (store: RootState) => store.config.activeFir
export const selectFirMajorAerodromes = createSelector(
  selectActiveFir,
  (fir) => [
    ...new Set(
      Object.values(FIR_SETTINGS[fir].pages).flatMap((p) => p.majorAerodromes),
    ),
  ],
)
export const selectFirAerodromes = createSelector(selectActiveFir, (fir) => [
  ...new Set(
    Object.values(FIR_SETTINGS[fir].pages).flatMap((p) => p.aerodromes),
  ),
])
export const selectFirRelevantAerodromes = createSelector(
  selectActiveFir,
  (fir) => [
    ...new Set(
      Object.values(FIR_SETTINGS[fir].pages).flatMap(
        (p) => p.relevantAerodromes,
      ),
    ),
  ],
)
export const selectFirAllAerodromes = createSelector(
  selectFirMajorAerodromes,
  selectFirAerodromes,
  (major, ads) => [...new Set([...major, ...ads])],
)
export const selectNeighbourPrefixes = createSelector(
  selectActiveFir,
  (fir) => FIR_SETTINGS[fir].neighbourPrefixes,
)
export const selectNeighbourFirs = createSelector(
  selectActiveFir,
  (fir) => FIR_SETTINGS[fir].neighbourFirs,
)
export const selectNotamDesignators = createSelector(
  selectFirMajorAerodromes,
  selectFirAerodromes,
  selectFirRelevantAerodromes,
  selectActiveFir,
  (major, ads, relevant, fir) => [...major, fir, ...ads, ...relevant],
)

export const { setActiveFir } = configSlice.actions
export const { reducer: configReducer } = configSlice
