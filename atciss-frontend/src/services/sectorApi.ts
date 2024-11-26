import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { Airspace, Position } from "types/vatglasses"
import { RootState } from "../app/store"

export const selectSectorData = api.endpoints.sectors.select()

export const selectPositions = createSelector(
  selectSectorData,
  (sectorDataResponse) =>
    Object.fromEntries(
      Object.entries(sectorDataResponse.data?.positions ?? {}),
    ),
)

export const selectPosition = createSelector(
  selectPositions,
  (_state: RootState, id: string | null) => id,
  (positions, id): Position | null => positions[id ?? ""] ?? null,
)

const emptyAirspaces: Record<string, Airspace> = {}
export const selectAirspace = createSelector(
  selectSectorData,
  (sectorDataResponse) => sectorDataResponse.data?.airspace ?? emptyAirspaces,
)
export const selectSectorIDs = createSelector(selectAirspace, (airspace) =>
  Object.keys(airspace),
)
export const selectSector = createSelector(
  selectAirspace,
  (_state: RootState, id: string) => id,
  (airspace, id) => airspace[id ?? ""],
)
