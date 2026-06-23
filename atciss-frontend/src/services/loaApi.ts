import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { RootState } from "../app/store"
import { selectOwnedSectors } from "services/activePositions"
import { LoaItem } from "types/loa"

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

export const selectByOwnedSectors = createSelector(
  selectOwnedSectors,
  api.endpoints.loaBySectors.select,
)
export const selectOwnedLoas = createSelector(
  (state: RootState) => state,
  selectByOwnedSectors,
  (state, selector) => selector(state)?.data ?? [],
)
export const selectRelevantLoas = createSelector(
  selectOwnedLoas,
  selectOwnedSectors,
  (loas, ownedSectors) =>
    loas.filter(
      (loa) =>
        !ownedSectors.includes(loa.from_sector) ||
        !ownedSectors.includes(loa.to_sector),
    ),
)

export const selectBorderAgreements = createSelector(
  selectRelevantLoas,
  (relevantLoas) => relevantLoas.filter((loa) => loa.cop === null),
)

export interface BorderAgreementGroup {
  from_sector: string
  to_sector: string
  vertical: boolean
  level: number | null
  exitAgreements: LoaItem[]
  entryAgreements: LoaItem[]
}

export const selectGroupedBorderAgreements = createSelector(
  selectBorderAgreements,
  selectOwnedSectors,
  (borderAgreements, ownedSectors) =>
    borderAgreements.reduce<BorderAgreementGroup[]>((groups, loa) => {
      const [s1, s2] = [loa.from_sector, loa.to_sector].sort() as [
        string,
        string,
      ]
      const isExit = ownedSectors.includes(loa.from_sector)

      const existing = groups.find(
        (g) =>
          ((g.from_sector === s1 && g.to_sector === s2) ||
            (g.from_sector === s2 && g.to_sector === s1)) &&
          g.vertical === loa.vertical &&
          (loa.vertical || g.level === loa.level),
      )

      if (existing) {
        return groups.map((g) =>
          g === existing
            ? {
                ...g,
                exitAgreements: isExit
                  ? [...g.exitAgreements, loa]
                  : g.exitAgreements,
                entryAgreements: isExit
                  ? g.entryAgreements
                  : [...g.entryAgreements, loa],
              }
            : g,
        )
      }

      return [
        ...groups,
        {
          from_sector: loa.from_sector,
          to_sector: loa.to_sector,
          vertical: loa.vertical,
          level: loa.vertical ? null : loa.level,
          exitAgreements: isExit ? [loa] : [],
          entryAgreements: isExit ? [] : [loa],
        },
      ]
    }, []),
)

export const selectRelevantExitLoas = createSelector(
  selectRelevantLoas,
  selectOwnedSectors,
  (relevantLoas, ownedSectors) =>
    relevantLoas
      .filter((loa) => ownedSectors.includes(loa.from_sector))
      .sort(sortBy(["from_sector", "cop", "to_sector", "adep", "ades"])),
)

export const selectRelevantEntryLoas = createSelector(
  selectRelevantLoas,
  selectOwnedSectors,
  (relevantLoas, ownedSectors) =>
    relevantLoas
      .filter((loa) => ownedSectors.includes(loa.to_sector))
      .sort(sortBy(["to_sector", "cop", "from_sector", "adep", "ades"])),
)

const filterFn = (filter: string) => (loa: LoaItem) =>
  (loa.adep ?? []).some((ad) => ad.includes(filter.toUpperCase())) ||
  (loa.ades ?? []).some((ad) => ad.includes(filter.toUpperCase())) ||
  loa.from_sector.toLowerCase().includes(filter.toLowerCase()) ||
  loa.to_sector.toLowerCase().includes(filter.toLowerCase()) ||
  loa.remarks?.toLowerCase().includes(filter.toLowerCase()) ||
  loa.cop?.toLowerCase().includes(filter.toLowerCase())

export const selectFilteredExitLoas = createSelector(
  selectRelevantExitLoas,
  (_state: RootState, filter: string) => filter,
  (loas, filter) => loas.filter(filterFn(filter)),
)

export const selectFilteredEntryLoas = createSelector(
  selectRelevantEntryLoas,
  (_state: RootState, filter: string) => filter,
  (loas, filter) => loas.filter(filterFn(filter)),
)

export const selectLoaCops = createSelector(
  selectRelevantLoas,
  (relevantLoas) => [
    ...new Set(
      relevantLoas.map((loa) => loa.cop).filter((cop) => cop !== null),
    ),
  ],
)

export const selectExitLoasByNavaid = createSelector(
  selectRelevantExitLoas,
  (_state: RootState, designator: string) => designator,
  (relevantLoas, designator) =>
    relevantLoas.filter((loa) => loa.cop == designator),
)

export const selectEntryLoasByNavaid = createSelector(
  selectRelevantEntryLoas,
  (_state: RootState, designator: string) => designator,
  (relevantLoas, designator) =>
    relevantLoas.filter((loa) => loa.cop == designator),
)
