import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { RootState } from "../app/store"

export const usePollAreas: typeof api.useAreasQuery = (_, options) =>
  api.useAreasQuery(_, { pollingInterval: 60000, ...options })

const selectAllAreas = createSelector(
  (state: RootState) => state,
  (state) => api.endpoints.areas.select()(state)?.data ?? [],
)

// FIXME currently or next active
export const selectArea = createSelector(
  selectAllAreas,
  (_state: RootState, name: string) => name,
  (areas, name) => areas.find((area) => area.name == name),
)
