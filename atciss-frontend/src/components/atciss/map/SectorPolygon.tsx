import { createSelector } from "@reduxjs/toolkit"
import { useAppSelector } from "app/hooks"
import { RootState } from "app/store"
import { z3 } from "app/utils"
import { Tooltip } from "components/atciss/map/Tooltip"
import { VerticalBoundary } from "components/atciss/map/VerticalBoundary"
import { LatLng } from "leaflet"
import { useState } from "react"
import { Polygon } from "react-leaflet"
import {
  selectControllerFromPosition,
  selectOwner,
  selectSelectedPosition,
} from "services/activePositions"
import { selectAirports } from "services/aerodrome"
import { api } from "services/api"
import { selectAllAtis } from "services/atisApi"
import { selectLevel } from "services/mapSlice"
import { selectSector } from "services/sectorApi"
import { Box, Text } from "theme-ui"
import { Sector as SectorBounds } from "types/vatglasses"

const selectSectorBounds = createSelector(
  selectSector,
  selectLevel,
  selectAirports,
  selectAllAtis,
  (_state: RootState, id: string) => id,
  (sector, level, airports, atis) =>
    sector.sectors
      .filter((s) => (s.min ?? 0) <= level && level < (s.max ?? 999))
      .filter(
        (s) =>
          s.runways.length === 0 ||
          s.runways.some((rwy) => {
            const rwysInUse = atis?.[rwy.icao]?.runways_in_use ?? []
            const rwyPriority = airports?.[rwy.icao]?.runways ?? []
            return rwysInUse.length > 0
              ? rwysInUse.some((activeRwy) =>
                  typeof rwy.runway === "string"
                    ? activeRwy.startsWith(rwy.runway)
                    : rwy.runway.every((rwy) => rwysInUse.includes(rwy)),
                )
              : rwyPriority[0] === rwy.runway
          }),
      ),
)

export const Sector = ({ id }: { id: string }) => {
  const owner = useAppSelector((store) => selectOwner(store, id))
  const sectorBounds = useAppSelector((store) => selectSectorBounds(store, id))

  return owner
    ? sectorBounds.map((sectorBounds, index) => (
        <SectorPolygon key={index} sectorBounds={sectorBounds} id={id} />
      ))
    : []
}

interface SectorPolygonProps {
  sectorBounds: SectorBounds
  id: string
}

export const SectorPolygon = ({
  sectorBounds: { points, min, max },
  id,
}: SectorPolygonProps) => {
  api.useSectorsQuery()
  const owner = useAppSelector((store) => selectOwner(store, id))
  const sector = useAppSelector((store) => selectSector(store, id))
  const selectedPosition = useAppSelector(selectSelectedPosition)
  const controller = useAppSelector((store) =>
    selectControllerFromPosition(store, owner?.id ?? null),
  )
  const [center, setCenter] = useState<LatLng | null>(null)

  return (
    owner && (
      <Polygon
        pathOptions={{
          color: owner?.colours[0]?.hex,
          weight: owner?.id === selectedPosition ? 5 : 1,
          opacity: 0.5,
          fillOpacity: owner?.id === selectedPosition ? 0.5 : 0.3,
        }}
        positions={points}
        eventHandlers={{
          add: (p) => setCenter(p.target.getCenter()),
        }}
      >
        <VerticalBoundary
          color={owner?.colours[0]?.hex}
          center={center}
          min={min}
          max={max}
        />
        <Tooltip>
          <Box sx={{ fontSize: "1", fontFamily: "body" }}>
            <Text variant="label">{sector.id}</Text>
            {(sector.remark || sector.uid) &&
              ` (${sector.uid ?? sector.remark})`}{" "}
            by {owner?.name} ({owner.frequency})
          </Box>
          {controller && (
            <Box sx={{ fontSize: "1" }}>
              {controller.name} ({controller.cid})
            </Box>
          )}
          <Box sx={{ fontSize: "1", fontFamily: "body" }}>
            FL{z3(min ?? 0)}&ndash;FL{z3(max ?? 660)}
          </Box>
        </Tooltip>
      </Polygon>
    )
  )
}
