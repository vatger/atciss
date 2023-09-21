import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { Position, SectorData, sectorApi } from "./airspaceApi"
import { Controller, controllerApi } from "./controllerApi"

type PositionStatus = {
  position: Position
  online: boolean
  manual: boolean
}
export type Positions = { [id: string]: PositionStatus }
type ActivePositionState = {
  positions: Positions
  syncedToOnline: boolean
  selectedPosition: string | null
}

const findSelectedPosition = (
  previousSelected: string | null,
  positions: Positions,
  syncedToOnline: boolean,
): string | null =>
  previousSelected &&
  positions[previousSelected][syncedToOnline ? "online" : "manual"]
    ? previousSelected
    : Object.entries(positions).find(
        ([_, p]) => p[syncedToOnline ? "online" : "manual"],
      )?.[0] ?? null

const activePositionSlice = createSlice({
  name: "activePositions",
  initialState: {
    positions: {},
    selectedPosition: null,
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
      state.selectedPosition = findSelectedPosition(
        state.selectedPosition,
        state.positions,
        state.syncedToOnline,
      )
    },
    setSyncedToOnline(state, { payload: synced }: PayloadAction<boolean>) {
      state.syncedToOnline = synced
      state.selectedPosition = findSelectedPosition(
        state.selectedPosition,
        state.positions,
        state.syncedToOnline,
      )
    },
    setSelectedPosition(state, { payload: pos }: PayloadAction<string>) {
      state.selectedPosition = pos
    },
    enableAllPositions(state) {
      const positions = Object.keys(state.positions).reduce(
        (acc, key) => ({ ...acc, [key]: { ...acc[key], manual: true } }),
        state.positions,
      )
      return {
        ...state,
        positions,
        selectedPosition: findSelectedPosition(
          state.selectedPosition,
          positions,
          state.syncedToOnline,
        ),
      }
    },
    disableAllPositions(state) {
      const positions = Object.keys(state.positions).reduce(
        (acc, key) => ({ ...acc, [key]: { ...acc[key], manual: false } }),
        state.positions,
      )
      return {
        ...state,
        positions,
        selectedPosition: findSelectedPosition(
          state.selectedPosition,
          positions,
          state.syncedToOnline,
        ),
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      sectorApi.endpoints.getByRegion.matchFulfilled,
      (
        state,
        {
          payload: { positions: positionsWithSupercenter },
        }: PayloadAction<SectorData>,
      ) => {
        const positions = {
          ...Object.entries(positionsWithSupercenter)
            .filter(([id]) => !["MMC", "WWC", "GGC"].includes(id))
            .reduce(
              (acc, [id, position]) => ({
                ...acc,
                [id]: {
                  position,
                  online: false,
                  manual: true,
                },
              }),
              {} as Positions,
            ),
          ...state.positions,
        }

        return {
          ...state,
          selectedPosition: findSelectedPosition(
            state.selectedPosition,
            positions,
            state.syncedToOnline,
          ),
          positions,
        }
      },
    )
    builder.addMatcher(
      controllerApi.endpoints.get.matchFulfilled,
      (state, { payload: controllers }: PayloadAction<Controller[]>) => {
        const onlineStations = controllers.map(
          (c) =>
            `${c.callsign.slice(0, c.callsign.indexOf("_"))}${c.frequency}`,
        )
        const positions = Object.entries(state.positions).reduce(
          (acc, [id, { position }]) => ({
            ...acc,
            [id]: {
              ...acc[id],
              online: position.pre.some(
                (prefix) =>
                  onlineStations.indexOf(`${prefix}${position.frequency}`) !==
                  -1,
              ),
            },
          }),
          state.positions,
        )

        return {
          ...state,
          selectedPosition: findSelectedPosition(
            state.selectedPosition,
            positions,
            state.syncedToOnline,
          ),
          positions,
        }
      },
    )
  },
})

export const selectActivePositions = (state: RootState) =>
  state.activePositions.positions
export const selectSyncedToOnline = (state: RootState) =>
  state.activePositions.syncedToOnline
export const selectSelectedPosition = (state: RootState) =>
  state.activePositions.selectedPosition
export const selectSectorToOwner = createSelector(
  [
    selectActivePositions,
    selectSyncedToOnline,
    sectorApi.endpoints.getByRegion.select(),
  ],
  (positions, online, sectorData) =>
    (sectorData.data?.airspace ?? []).reduce(
      (acc, s) => ({
        ...acc,
        [s.remark ?? s.id]:
          s.owner.find(
            (owner) => positions[owner]?.[online ? "online" : "manual"],
          ) ?? null,
      }),
      {} as { [id: string]: string | null },
    ),
)

export const selectOwnerToSector = createSelector(
  [selectSectorToOwner],
  (sectorToOwner) =>
    Object.entries(sectorToOwner)
      .filter(([_, owner]) => owner !== null)
      .reduce((acc, [sector, ownerIsFiltered]) => {
        const owner = ownerIsFiltered as string
        return {
          ...acc,
          [owner]: [...(acc[owner] ?? []), sector],
        }
      }, {} as { [id: string]: string[] }),
)

export const {
  setPosition,
  enableAllPositions,
  disableAllPositions,
  setSyncedToOnline,
  setSelectedPosition,
} = activePositionSlice.actions
export const { reducer: activePositionReducer } = activePositionSlice
