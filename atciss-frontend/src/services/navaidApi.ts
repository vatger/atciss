import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { RootState } from "../app/store"
import { createSelector } from "@reduxjs/toolkit"
import { createCachedSelector } from "re-reselect"
import { selectLoaCops } from "./loaApi"
import { LatLngExpression } from "leaflet"
import { selectSearch, selectSelectedAirway } from "./mapSlice"

export interface Navaid {
  id: string
  designator: string
  name: string
  type: string
  location: LatLngExpression
  channel?: string
  frequency?: number
  aerodrome_id?: string
  remark?: string
  operation_remark?: string
}

export const navaidApi = createApi({
  reducerPath: "navaid",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByDesignators: builder.query<Navaid[], string[]>({
      query: (designatorList) => ({
        url: `navaid`,
        params: designatorList.map((desig) => ["id", desig]),
      }),
    }),
    search: builder.query<Navaid[], string>({
      query: (searchStr) => ({
        url: `navaid/search`,
        params: { q: searchStr },
      }),
    }),
    getByAirway: builder.query<Navaid[], string | null>({
      query: (airway) => ({
        url: `navaid/airway/${airway}`,
      }),
    }),
  }),
})

const selectLoaNavaids = createSelector(
  (state: RootState) => state,
  selectLoaCops,
  (state, navaids) =>
    navaidApi.endpoints.getByDesignators.select(navaids)(state)?.data ?? [],
)

export const selectLoaNavaid = createCachedSelector(
  selectLoaNavaids,
  (_state: RootState, designator: string) => designator,
  (navaids, designator) => navaids.find((n) => n.designator == designator),
)((_state, designator) => designator)

export const selectSearchedNavaids = createSelector(
  (state: RootState) => state,
  selectSearch,
  (state, search) =>
    navaidApi.endpoints.search.select(search)(state)?.data ?? [],
)

export const selectAirwayNavaids = createSelector(
  (state: RootState) => state,
  selectSelectedAirway,
  (state, airway) =>
    navaidApi.endpoints.getByAirway.select(airway)(state)?.data ?? [],
)
