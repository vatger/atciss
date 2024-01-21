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
      !queryParams.has("pos"),
    positionSyncedToOnline: localStorageOrDefault(
      "activePositions.positionSyncedToOnline",
      true,
    ),
    manualActive: queryParams
      .getAll("pos")
      .reduce((acc, pos) => ({ ...acc, [pos]: true }), {}),
    onlineActive: {},
    controlType: queryParams.has("pos")
      ? "presets"
      : localStorageOrDefault("activePositions.controlType", "manual"),
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
    enableOnlyPositions(state, { payload: sectors }: PayloadAction<string[]>) {
      return {
        ...state,
        manualActive: Object.fromEntries(
          Object.keys(state.manualActive).map((id) => [
            id,
            sectors.includes(id),
          ]),
        ),
      }
    },
    setControlType(
      state,
      { payload: controlType }: PayloadAction<"manual" | "presets">,
    ) {
      state.controlType = controlType
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
                [id]: true && !queryParams.has("pos"),
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
  enableOnlyPositions,
  disableAllPositions,
  setSectorsSyncedToOnline,
  setPositionSyncedToOnline,
  setSelectedPosition,
  setControlType,
} = activePositionSlice.actions
export const { reducer: activePositionReducer } = activePositionSlice
