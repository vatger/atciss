import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { RootState } from "../app/store"
import { createSelector } from "@reduxjs/toolkit"
import createCachedSelector from "re-reselect"
import { selectLoaCops } from "./loaApi"

export interface Navaid {
  id: string
  designator: string
  name: string
  type: string
  location: number[]
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
  }),
})

const selectLOANavaids = createSelector(
  (state: RootState) => state,
  selectLoaCops,
  (state, navaids) =>
    navaidApi.endpoints.getByDesignators.select(navaids)(state)?.data ?? [],
)

export const selectLOANavaid = createCachedSelector(
  [selectLOANavaids, (_state: RootState, designator: string) => designator],
  (navaids, designator) => navaids.find((n) => n.designator == designator),
)((_state, designator) => designator)
