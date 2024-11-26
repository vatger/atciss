import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"

interface AircraftState {
  query: string
}

const aircraftSlice = createSlice({
  name: "aircraft",
  initialState: {
    query: localStorageOrDefault("aircraft.query", ""),
  } as AircraftState,
  reducers: {
    setQuery(state, { payload: query }: PayloadAction<string>) {
      state.query = setLocalStorage("aircraft.query", query)
    },
  },
})

export const selectQuery = (store: RootState) => store.aircraft.query

export const { setQuery } = aircraftSlice.actions
export const { reducer: aircraftReducer } = aircraftSlice
