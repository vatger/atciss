import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { selectOwnedSectors } from "./activePositionSlice"
import { createCachedSelector } from "re-reselect"

export type LoaItem = {
  aerodrome: string // FIXME: should be string[]
  adep_ades: "ADEP" | "ADES" | null
  cop: string
  level: number
  feet: boolean
  xc: string | null
  special_conditions: string
  from_sector: string
  to_sector: string
  from_fir: string
  to_fir: string
}

export const loaApi = createApi({
  reducerPath: "loa",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getBySectors: builder.query<LoaItem[], string[]>({
      query: (sectors) => ({
        url: `loa/`,
        params: sectors.map((sector) => ["sector", sector.replace(/.*\//, "")]),
      }),
    }),
  }),
})

const sortBy = (attrs: (keyof LoaItem)[]) => (a: LoaItem, b: LoaItem) => {
  for (const attr of attrs) {
    if (a[attr] === null || typeof a[attr] === "boolean") continue
    const comp =
      typeof a[attr] === "string"
        ? (a[attr] as string).localeCompare(b[attr] as string)
        : (a[attr] as number) - (b[attr] as number)
    if (comp !== 0) return comp
  }

  return 0
}

const selectRelevantLoas = createSelector(
  (state: RootState) => state,
  selectOwnedSectors,
  (state, ownedSectors) =>
    (
      loaApi.endpoints.getBySectors.select(ownedSectors)(state)?.data ?? []
    ).filter(
      (loa) =>
        !ownedSectors.includes(loa.from_sector) ||
        !ownedSectors.includes(loa.to_sector),
    ),
)

export const selectRelevantExitLoas = createSelector(
  selectRelevantLoas,
  selectOwnedSectors,
  (relevantLoas, ownedSectors) =>
    relevantLoas
      .filter((loa) => ownedSectors.includes(loa.from_sector))
      .sort(sortBy(["from_sector", "cop", "to_sector", "to_fir", "adep_ades"])),
)

export const selectRelevantEntryLoas = createSelector(
  selectRelevantLoas,
  selectOwnedSectors,
  (relevantLoas, ownedSectors) =>
    relevantLoas
      .filter((loa) => ownedSectors.includes(loa.to_sector))
      .sort(
        sortBy(["to_sector", "cop", "from_sector", "from_fir", "adep_ades"]),
      ),
)

const filterFn = (filter: string, to_from: "to" | "from") => (loa: LoaItem) =>
  loa.aerodrome.toLowerCase().includes(filter.toLowerCase()) ||
  loa.from_sector.toLowerCase().includes(filter.toLowerCase()) ||
  loa.to_sector.toLowerCase().includes(filter.toLowerCase()) ||
  loa[`${to_from}_fir`].toLowerCase().includes(filter.toLowerCase()) ||
  loa.special_conditions.toLowerCase().includes(filter.toLowerCase()) ||
  loa.cop.toLowerCase().includes(filter.toLowerCase())

export const selectFilteredExitLoas = createCachedSelector(
  selectRelevantExitLoas,
  (_state: RootState, filter: string) => filter,
  (loas, filter) => loas.filter(filterFn(filter, "to")),
)((_state, icao) => icao)

export const selectFilteredEntryLoas = createCachedSelector(
  selectRelevantEntryLoas,
  (_state: RootState, filter: string) => filter,
  (loas, filter) => loas.filter(filterFn(filter, "from")),
)((_state, icao) => icao)

export const selectLoaCops = createSelector(
  selectRelevantLoas,
  (relevantLoas) => [...new Set(relevantLoas.map((loa) => loa.cop))],
)

export const selectExitLoasByNavaid = createCachedSelector(
  selectRelevantExitLoas,
  (_state: RootState, designator: string) => designator,
  (relevantLoas, designator) =>
    relevantLoas.filter((loa) => loa.cop == designator),
)((_state, designator) => designator)

export const selectEntryLoasByNavaid = createCachedSelector(
  selectRelevantEntryLoas,
  (_state: RootState, designator: string) => designator,
  (relevantLoas, designator) =>
    relevantLoas.filter((loa) => loa.cop == designator),
)((_state, designator) => designator)
