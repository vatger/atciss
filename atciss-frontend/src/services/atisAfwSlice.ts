import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { FIR_SETTINGS } from "../app/config"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"
import { selectActiveFir } from "./configSlice"

type AtisAfwState = {
  activePagePerFir: { [fir: string]: string }
}

const atisAfwSlice = createSlice({
  name: "atisAfw",
  initialState: {
    activePagePerFir: Object.keys(FIR_SETTINGS).reduce(
      (state, fir) => ({
        ...state,
        [fir]: localStorageOrDefault(
          `atisAfw.activePagePerFir.${fir}`,
          Object.keys(FIR_SETTINGS[fir].pages).shift(),
        ),
      }),
      {},
    ),
  } as AtisAfwState,
  reducers: {
    setActivePage(
      state,
      { payload: { fir, page } }: PayloadAction<{ fir: string; page: string }>,
    ) {
      state.activePagePerFir[fir] = setLocalStorage(
        `atisAfw.activePagePerFir.${fir}`,
        page,
      )
    },
  },
})

const selectActivePages = (store: RootState) => store.atisAfw.activePagePerFir
export const selectActivePageName = createSelector(
  selectActiveFir,
  selectActivePages,
  (fir, activePages) => activePages[fir],
)
export const selectActivePage = createSelector(
  selectActiveFir,
  selectActivePageName,
  (fir, page) =>
    FIR_SETTINGS[fir].pages[page] ??
    Object.values(FIR_SETTINGS[fir].pages).shift(),
)
export const selectPageNames = createSelector(selectActiveFir, (fir) =>
  Object.keys(FIR_SETTINGS[fir].pages),
)

export const selectPageAerodromes = createSelector(selectActivePage, (page) => [
  ...page.aerodromes,
  ...page.relevantAerodromes,
])
export const selectPageAtisAerodromes = createSelector(
  selectActivePage,
  (page) => page.majorAerodromes,
)
export const selectStatusSectors = createSelector(
  selectActivePage,
  (page) => page.statusSectors,
)
export const selectStaffingSectors = createSelector(
  selectActivePage,
  (page) => page.staffingSectors,
)
export const selectAtisAreas = createSelector(
  selectActivePage,
  (page) => page.areas,
)

export const { setActivePage } = atisAfwSlice.actions
export const { reducer: atisAfwReducer } = atisAfwSlice
