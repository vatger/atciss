import { useAppSelector } from "app/hooks"
import { z3 } from "app/utils"
import { LatLng } from "leaflet"
import { DateTime, Duration } from "luxon"
import { useState } from "react"
import { LayerGroup, Polygon } from "react-leaflet"
import { usePollAreas } from "services/areaApi"
import {
  selectAreasVLARAOnMap,
  selectAreasDFSOnMap,
  selectLevel,
} from "services/mapSlice"
import { Box, Text } from "theme-ui"
import { AreaBooking } from "types/area"
import { VerticalBoundary } from "./VerticalBoundary"
import { Tooltip } from "components/atciss/map/Tooltip"

const Area = ({ area }: { area: AreaBooking }) => {
  const [center, setCenter] = useState<LatLng | null>(null)

  const start = DateTime.fromISO(area.start).toUTC()
  const end = DateTime.fromISO(area.end).toUTC()
  const active = DateTime.utc() >= start

  return (
    <Polygon
      pathOptions={{
        color: active ? "#ff0000" : "#ff9900",
        weight: 5,
        opacity: 1,
        fillOpacity: 0.5,
      }}
      positions={area.polygon}
      eventHandlers={{
        add: (p) => setCenter(p.target.getCenter()),
      }}
    >
      <VerticalBoundary
        min={area.lower_limit}
        max={area.upper_limit}
        center={center}
        color={active ? "#ff0000" : "#ff9900"}
      />
      <Tooltip>
        <Box sx={{ fontSize: "1" }}>
          <Text variant="label">{area.name}</Text>
        </Box>
        <Box sx={{ fontSize: "1" }}>
          FL{z3(area.lower_limit ?? 0)}-FL
          {z3(area.upper_limit ?? 660)}
        </Box>
        <Box sx={{ fontSize: "1" }}>
          <Text variant="label" sx={{ color: active ? "#ff0000" : "#ff9900" }}>
            {active
              ? `Active, deactivates ${end.setLocale("en").toRelative()}`
              : `Will be active ${start.setLocale("en").toRelative()}`}
          </Text>{" "}
        </Box>
        <Box sx={{ fontSize: "1" }}>
          {`${start.toFormat("y-MM-dd HH:mm")}-${end.toFormat(
            "y-MM-dd HH:mm",
          )}`}
        </Box>
        {area.source === "vlara" && (
          <>
            <Box>{area.agency}</Box>
            <Box>
              {area.activity_type} with {area.nbr_acft} ACFT
            </Box>
          </>
        )}
      </Tooltip>
    </Polygon>
  )
}

export const AreaLayer = () => {
  const { data: areas } = usePollAreas()

  const level = useAppSelector(selectLevel)
  const areas_dfs = useAppSelector(selectAreasDFSOnMap)
  const areas_vlara = useAppSelector(selectAreasVLARAOnMap)

  const levelFilter = (a: AreaBooking) =>
    (a.lower_limit ?? 0) <= level && level < (a.upper_limit ?? 999)
  const isActive = (a: AreaBooking) =>
    DateTime.fromISO(a.start).toUTC() <=
      DateTime.utc().plus(Duration.fromObject({ minutes: 30 })) &&
    DateTime.fromISO(a.end).toUTC() >= DateTime.utc()
  const sourceFilter = (a: AreaBooking) =>
    (areas_dfs && a.source === "dfs_aup") ||
    (areas_vlara && a.source === "vlara")

  return (
    <LayerGroup>
      {areas
        ?.filter(levelFilter)
        .filter(sourceFilter)
        .filter(isActive)
        .map((area) => (
          <Area
            area={area}
            key={`${area.name}-${area.lower_limit}-${area.upper_limit}`}
          />
        ))}
    </LayerGroup>
  )
}
