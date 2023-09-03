import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { Position } from "./airspaceApi"

type ActivePositionState = {
  [id: string]: boolean
}

const activePositionSlice = createSlice({
  name: "auth",
  initialState: {} as ActivePositionState,
  reducers: {
    setPosition(
      state,
      {
        payload: { id, active },
      }: PayloadAction<{ id: string; active: boolean }>,
    ) {
      return {
        ...state,
        [id]: active,
      }
    },
    enableAllPositions(state) {
      return Object.keys(state).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
      )
    },
    disableAllPositions(state) {
      return Object.keys(state).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {},
      )
    },
    setAvailablePositions(
      state,
      { payload: positions }: PayloadAction<{ [indicator: string]: Position }>,
    ) {
      return {
        ...Object.keys(positions)
          .filter((id) => !["MMC", "WWC", "GGC"].includes(id))
          .reduce(
            (acc, id) => ({ ...acc, [id]: true }),
            {} as ActivePositionState,
          ),
        ...state,
      }
    },
  },
})

export const selectActivePositions = (store: RootState) => store.activePositions

export const {
  setPosition,
  enableAllPositions,
  disableAllPositions,
  setAvailablePositions,
} = activePositionSlice.actions
export const { reducer: activePositionReducer } = activePositionSlice
