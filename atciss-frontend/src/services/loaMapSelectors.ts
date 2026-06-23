import { createSelector } from "@reduxjs/toolkit"
import {
  findSharedBorder,
  mergeCoincidentSegments,
  removeCoveredSegments,
  sectorVolumesAtLevel,
  verticalBorderPolygons,
} from "services/borderAgreementGeometry"
import { selectGroupedBorderAgreements } from "services/loaApi"
import { selectAirspace } from "services/sectorApi"
import { LoaItem } from "types/loa"

export interface VerticalBorderGroup {
  key: string
  exitAgreements: LoaItem[]
  entryAgreements: LoaItem[]
  polygons: [number, number][][]
}

export const selectLateralBorderSegments = createSelector(
  selectGroupedBorderAgreements,
  selectAirspace,
  (groups, airspace) =>
    mergeCoincidentSegments(
      groups
        .filter((group) => !group.vertical)
        .flatMap((group) => {
          const fromSlices = sectorVolumesAtLevel(
            airspace[group.from_sector],
            group.level ?? 0,
          )
          const toSlices = sectorVolumesAtLevel(
            airspace[group.to_sector],
            group.level ?? 0,
          )
          return removeCoveredSegments(
            fromSlices.flatMap((a) =>
              toSlices.flatMap((b) => findSharedBorder(a, b)),
            ),
          ).map((segment) => ({
            key: `${group.from_sector}${group.to_sector}`,
            segment,
            exitAgreements: group.exitAgreements,
            entryAgreements: group.entryAgreements,
          }))
        }),
    ),
)

export const selectVerticalBorderGroups = createSelector(
  selectGroupedBorderAgreements,
  selectAirspace,
  (groups, airspace) =>
    groups
      .filter((group) => group.vertical)
      .map((group) => ({
        key: `${group.from_sector}|${group.to_sector}`,
        exitAgreements: group.exitAgreements,
        entryAgreements: group.entryAgreements,
        polygons: verticalBorderPolygons(
          airspace[group.from_sector],
          airspace[group.to_sector],
        ),
      }))
      .filter((group) => group.polygons.length > 0),
)
