import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { api } from "services/api"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"
import { SectorData } from "types/vatglasses"
import { ActivePositionState } from "types/activePositions"

const queryParams = new URLSearchParams(window.location.search)

const activePositionSlice = createSlice({
  name: "activePositions",
  initialState: {
    positions: {},
    selectedPosition: localStorageOrDefault(
      "activePositions.selectedPosition",
      null,
    ),
    sectorsSyncedToOnline:
      localStorageOrDefault("activePositions.sectorsSyncedToOnline", true) &&
      !queryParams.has("sector"),
    positionSyncedToOnline: localStorageOrDefault(
      "activePositions.positionSyncedToOnline",
      true,
    ),
    manualActive: queryParams
      .getAll("sector")
      .reduce((acc, sector) => ({ ...acc, [sector]: true }), {}),
    onlineActive: {},
  } as ActivePositionState,
  reducers: {
    setPosition(
      state,
      {
        payload: { id, active },
      }: PayloadAction<{ id: string; active: boolean }>,
    ) {
      state.manualActive[id] = active
    },
    setPositionGroup(
      state,
      {
        payload: { positions, active },
      }: PayloadAction<{ positions: string[]; active: boolean }>,
    ) {
      state.manualActive = {
        ...state.manualActive,
        ...positions.reduce((acc, pos) => ({ ...acc, [pos]: active }), {}),
      }
    },
    setSectorsSyncedToOnline(
      state,
      { payload: synced }: PayloadAction<boolean>,
    ) {
      state.sectorsSyncedToOnline = setLocalStorage(
        "activePositions.sectorsSyncedToOnline",
        synced,
      )
    },
    setPositionSyncedToOnline(
      state,
      { payload: synced }: PayloadAction<boolean>,
    ) {
      state.positionSyncedToOnline = setLocalStorage(
        "activePositions.positionSyncedToOnline",
        synced,
      )
    },
    setSelectedPosition(state, { payload: pos }: PayloadAction<string>) {
      state.selectedPosition = setLocalStorage(
        "activePositions.selectedPosition",
        pos,
      )
    },
    enableAllPositions(state) {
      return {
        ...state,
        manualActive: Object.fromEntries(
          Object.keys(state.manualActive).map((id) => [id, true]),
        ),
      }
    },
    disableAllPositions(state) {
      return {
        ...state,
        manualActive: Object.fromEntries(
          Object.keys(state.manualActive).map((id) => [id, false]),
        ),
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.sectors.matchFulfilled,
      (state, { payload: { positions } }: PayloadAction<SectorData>) => {
        return {
          ...state,
          manualActive: {
            ...Object.keys(positions).reduce(
              (acc, id) => ({
                ...acc,
                [id]: true && !queryParams.has("sector"),
              }),
              {},
            ),
            ...state.manualActive,
          },
        }
      },
    )
  },
})

export const {
  setPosition,
  setPositionGroup,
  enableAllPositions,
  disableAllPositions,
  setSectorsSyncedToOnline,
  setPositionSyncedToOnline,
  setSelectedPosition,
} = activePositionSlice.actions
export const { reducer: activePositionReducer } = activePositionSlice
