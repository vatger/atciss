import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { RootState } from "../app/store"
import { selectStatusSectors } from "./atisAfwSlice"

export type StatusEnum = "0" | "1" | "2" | "3"

export interface SectorStatus {
  id: string
  status: StatusEnum
  changed_by_cid: string
  updated_at: string
}

export const usePollSectorStatus: typeof api.useSectorStatusByIdsQuery = (
  ids,
  options,
) => api.useSectorStatusByIdsQuery(ids, { pollingInterval: 5000, ...options })

const selectStatusIds = createSelector(selectStatusSectors, (ids) =>
  api.endpoints.sectorStatusByIds.select(ids.flat()),
)
export const selectSectorStatus = createSelector(
  (state: RootState) => state,
  selectStatusIds,
  (state, selector) => selector(state)?.data ?? {},
)
