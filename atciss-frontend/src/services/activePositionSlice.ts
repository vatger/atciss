import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import {
  Airspace,
  Position,
  SectorData,
  sectorApi,
  selectAirport,
  selectAirspace,
  selectPositions,
  selectSector,
} from "./sectorApi"
import { localStorageOrDefault, setLocalStorage } from "../app/utils"
import createCachedSelector from "re-reselect"
import { selectControllers } from "./controllerApi"

export type PositionStatus = { [id: string]: boolean }
type ActivePositionState = {
  manualActive: PositionStatus
  syncedToOnline: boolean
  selectedPosition: string | null
}

const activePositionSlice = createSlice({
  name: "activePositions",
  initialState: {
    positions: {},
    selectedPosition: localStorageOrDefault(
      "activePositions.selectedPosition",
      null,
    ),
    syncedToOnline: localStorageOrDefault(
      "activePositions.syncedToOnline",
      true,
    ),
    manualActive: {},
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
    setSyncedToOnline(state, { payload: synced }: PayloadAction<boolean>) {
      state.syncedToOnline = setLocalStorage(
        "activePositions.syncedToOnline",
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
      sectorApi.endpoints.get.matchFulfilled,
      (state, { payload: { positions } }: PayloadAction<SectorData>) => {
        return {
          ...state,
          manualActive: {
            ...Object.keys(positions).reduce(
              (acc, id) => ({
                ...acc,
                [id]: true,
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

const selectControllerMatchStrings = createSelector(
  selectControllers,
  (controllers) =>
    controllers.map(
      (c) => `${c.callsign.slice(0, c.callsign.indexOf("_"))}${c.frequency}`,
    ),
)
export const selectOnlinePositions = createSelector(
  selectControllerMatchStrings,
  selectPositions,
  (cms, positions) =>
    Object.fromEntries(
      Object.entries(positions).map(([id, position]) => [
        id,
        position.pre.some(
          (prefix) => cms.indexOf(`${prefix}${position.frequency}`) !== -1,
        ),
      ]),
    ),
)

export const selectActivePositions = (state: RootState) =>
  state.activePositions.syncedToOnline
    ? selectOnlinePositions(state)
    : state.activePositions.manualActive
export const selectSyncedToOnline = (state: RootState) =>
  state.activePositions.syncedToOnline
export const selectSelectedPosition = createSelector(
  (state: RootState) => state.activePositions.selectedPosition,
  selectActivePositions,
  (selected, active) =>
    active[selected ?? ""]
      ? selected
      : Object.entries(active).find(([, isActive]) => isActive)?.[0] ?? null,
)

export const selectIsPositionActive = createCachedSelector(
  [selectActivePositions, (_state: RootState, pos: string) => pos],
  (activePositions, pos) => activePositions[pos],
)((_state, pos) => pos)

export const selectGroupToPositions = createSelector(
  selectPositions,
  (positions) =>
    Object.entries(positions).reduce(
      (acc, [id, pos]) => ({
        ...acc,
        [pos.pre[0]]: [...(acc[pos.pre[0]] ?? []), id],
      }),
      {} as { [index: string]: string[] },
    ),
)

export const selectPositionsByGroup = createCachedSelector(
  [selectGroupToPositions, (_state: RootState, group: string) => group],
  (groupToPositions, group) => groupToPositions[group] ?? [],
)((_state, group) => group)

export const selectIsGroupActive = createCachedSelector(
  [
    selectActivePositions,
    selectPositionsByGroup,
    (_state: RootState, group: string) => group,
  ],
  (activePositions, positions) => positions.some((pos) => activePositions[pos]),
)((_state, group) => group)

export const selectPositionGroups = createSelector(
  selectPositions,
  selectOnlinePositions,
  selectGroupToPositions,
  selectSyncedToOnline,
  (positions, onlinePositions, groupToPositions, syncedToOnline) => {
    const groups = [...new Set(Object.values(positions).flatMap((p) => p.pre))]
    return syncedToOnline
      ? groups.filter((group) =>
          groupToPositions[group]?.some((pos) => onlinePositions[pos]),
        )
      : groups
  },
)

const ownerFromSectorsActivePositions = (
  sector: Airspace | null,
  positions: PositionStatus,
) => sector?.owner.find((owner) => positions[owner]) ?? null

export const selectOwnedSectors = createSelector(
  [selectActivePositions, selectAirspace, selectSelectedPosition],
  (activePositions, sectors, pos) =>
    Object.entries(sectors).reduce(
      (acc, [id, s]) =>
        ownerFromSectorsActivePositions(s, activePositions) === pos
          ? [...acc, id.replace(/.*\//, "")] // FIXME check
          : acc,
      [] as string[],
    ) ?? [],
)

const getOwner = (
  sector: Airspace,
  activePositions: PositionStatus,
  positions: { [id: string]: Position },
) => {
  const owner = ownerFromSectorsActivePositions(sector, activePositions)
  return owner ? positions[owner] : null
}
export const selectOwner = createCachedSelector(
  [
    selectSector,
    selectActivePositions,
    selectPositions,
    (_state: RootState, sector: string) => sector,
  ],
  getOwner,
)((_state, sector) => sector)

export const selectOnlineOwner = createCachedSelector(
  [
    selectSector,
    selectOnlinePositions,
    selectPositions,
    (_state: RootState, sector: string) => sector,
  ],
  getOwner,
)((_state, sector) => sector)

export const selectAirportController = createCachedSelector(
  [
    selectAirport,
    selectActivePositions,
    (_state: RootState, sector: string) => sector,
  ],
  (airport, positions): string | null =>
    (airport?.topdown.find(
      (pos) => typeof pos === "string" && positions[pos],
    ) as string | undefined) ?? null,
  //  TODO don't ignore rwy-dependent topdown
)((_state, sector) => sector)

export const {
  setPosition,
  setPositionGroup,
  enableAllPositions,
  disableAllPositions,
  setSyncedToOnline,
  setSelectedPosition,
} = activePositionSlice.actions
export const { reducer: activePositionReducer } = activePositionSlice
