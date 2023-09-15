import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { SectorData, sectorApi } from "./airspaceApi"
import { Controller, controllerApi } from "./controllerApi"

type Position = {
  frequency: string
  online: boolean
  manual: boolean
}
type Positions = { [id: string]: Position }
type ActivePositionState = {
  positions: Positions
  syncedToOnline: boolean
}

const activePositionSlice = createSlice({
  name: "auth",
  initialState: {
    positions: {},
    syncedToOnline: true,
  } as ActivePositionState,
  reducers: {
    setPosition(
      state,
      {
        payload: { id, active },
      }: PayloadAction<{ id: string; active: boolean }>,
    ) {
      state.positions[id].manual = active
    },
    setSyncedToOnline(state, { payload: synced }: PayloadAction<boolean>) {
      return {
        ...state,
        syncedToOnline: synced,
      }
    },
    enableAllPositions(state) {
      return {
        ...state,
        positions: Object.keys(state.positions).reduce(
          (acc, key) => ({ ...acc, [key]: { ...acc[key], manual: true } }),
          state.positions,
        ),
      }
    },
    disableAllPositions(state) {
      return {
        ...state,
        positions: Object.keys(state.positions).reduce(
          (acc, key) => ({ ...acc, [key]: { ...acc[key], manual: false } }),
          state.positions,
        ),
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      sectorApi.endpoints.getByRegion.matchFulfilled,
      (state, { payload: { positions } }: PayloadAction<SectorData>) => ({
        ...state,
        positions: {
          ...Object.entries(positions)
            .filter(([id]) => !["MMC", "WWC", "GGC"].includes(id))
            .reduce(
              (acc, [id, position]) => ({
                ...acc,
                [id]: {
                  frequency: position.frequency,
                  online: false,
                  manual: true,
                },
              }),
              {} as Positions,
            ),
          ...state.positions,
        },
      }),
    )
    builder.addMatcher(
      controllerApi.endpoints.get.matchFulfilled,
      (state, { payload: controllers }: PayloadAction<Controller[]>) => {
        const onlineFrequencies = controllers.map((c) => c.frequency)
        return {
          ...state,
          positions: Object.entries(state.positions).reduce(
            (acc, [id, position]) => ({
              ...acc,
              [id]: {
                ...acc[id],
                online: onlineFrequencies.indexOf(position.frequency) !== -1,
              },
            }),
            state.positions,
          ),
        }
      },
    )
  },
})

export const selectActivePositions = (store: RootState) =>
  store.activePositions.positions
export const selectSyncedToOnline = (store: RootState) =>
  store.activePositions.syncedToOnline

export const {
  setPosition,
  enableAllPositions,
  disableAllPositions,
  setSyncedToOnline,
} = activePositionSlice.actions
export const { reducer: activePositionReducer } = activePositionSlice
