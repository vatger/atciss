import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "app/store"
import { selectAirport } from "services/aerodrome"
import { selectControllers, selectMe } from "services/controllerApi"
import {
  selectAirspace,
  selectPosition,
  selectPositions,
  selectSector,
} from "services/sectorApi"
import { PositionStatus } from "types/activePositions"
import { Airspace, Position } from "types/vatglasses"
import { Controller } from "types/vatsim"

const controllerMatchString = (c: Controller) =>
  `${c.callsign.slice(0, c.callsign.indexOf("_"))}${c.frequency}`
const selectControllerMatchStrings = createSelector(
  selectControllers,
  (controllers) => controllers.map(controllerMatchString),
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
export const selectControllerFromPosition = createSelector(
  selectControllers,
  selectPosition,
  (controllers, pos) =>
    controllers.find((c) =>
      pos?.pre.some(
        (prefix) => controllerMatchString(c) === `${prefix}${pos.frequency}`,
      ),
    ),
)

export const selectActivePositions = (state: RootState) =>
  state.activePositions.sectorsSyncedToOnline
    ? selectOnlinePositions(state)
    : state.activePositions.manualActive
export const selectPositionSyncedToOnline = (state: RootState) =>
  state.activePositions.positionSyncedToOnline
export const selectSectorsSyncedToOnline = (state: RootState) =>
  state.activePositions.sectorsSyncedToOnline
export const selectSelectedPosition = createSelector(
  (state: RootState) => state.activePositions.selectedPosition,
  selectActivePositions,
  selectPositionSyncedToOnline,
  selectMe,
  selectPositions,
  (selected, active, synced, me, positions) =>
    synced && me
      ? Object.entries(positions).find(([, pos]) =>
          pos?.pre.some(
            (prefix) =>
              `${prefix}${pos.frequency}` === controllerMatchString(me),
          ),
        )?.[0] ?? null
      : active[selected ?? ""]
        ? selected
        : Object.entries(active).find(([, isActive]) => isActive)?.[0] ?? null,
)

export const selectIsPositionActive = createSelector(
  selectActivePositions,
  (_state: RootState, pos: string) => pos,
  (activePositions, pos) => activePositions[pos],
)

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

export const selectPositionsByGroup = createSelector(
  selectGroupToPositions,
  (_state: RootState, group: string) => group,
  (groupToPositions, group) => groupToPositions[group] ?? [],
)

export const selectIsGroupActive = createSelector(
  selectActivePositions,
  selectPositionsByGroup,
  (_state: RootState, group: string) => group,
  (activePositions, positions) => positions.some((pos) => activePositions[pos]),
)

export const selectPositionGroups = createSelector(
  selectPositions,
  selectOnlinePositions,
  selectGroupToPositions,
  selectSectorsSyncedToOnline,
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
  selectActivePositions,
  selectAirspace,
  selectSelectedPosition,
  (activePositions, sectors, pos) =>
    pos === null
      ? []
      : Object.entries(sectors).reduce(
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
export const selectOwner = createSelector(
  selectSector,
  selectActivePositions,
  selectPositions,
  (_state: RootState, sector: string) => sector,
  getOwner,
)

export const selectOnlineOwner = createSelector(
  selectSector,
  selectOnlinePositions,
  selectPositions,
  (_state: RootState, sector: string) => sector,
  getOwner,
)

export const selectAirportControllers = createSelector(
  selectControllers,
  (_state: RootState, airportDesignator: string) => airportDesignator,
  (controllers, airport): Controller[] =>
    controllers.filter((c) => {
      const cs_splits = c.callsign.split("_")
      return (
        cs_splits[0] === airport &&
        ["DEL", "GND", "TWR"].includes(cs_splits[cs_splits.length - 1])
      )
    }),
)

export const selectAirportTopdownController = createSelector(
  selectAirport,
  selectActivePositions,
  (_state: RootState, airportDesignator: string) => airportDesignator,

  (airport, positions): string | null =>
    (airport?.topdown.find(
      (pos) => typeof pos === "string" && positions[pos],
    ) as string | undefined) ?? null,
  //  TODO don't ignore rwy-dependent topdown
)
