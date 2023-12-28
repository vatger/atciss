import { LayerGroup, Polygon, Tooltip } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import { selectLevel } from "../../services/mapSlice"
import { AreaBooking, usePollAreas } from "../../services/areaApi"
import { Box, Text } from "theme-ui"
import { z3 } from "../../app/utils"
import { DateTime, Duration } from "luxon"
import { useState } from "react"
import { LatLng } from "leaflet"
import { VerticalBoundary } from "./VerticalBoundary"

const Area = ({ area }: { area: AreaBooking }) => {
  const [center, setCenter] = useState<LatLng | null>(null)

  const start = DateTime.fromISO(area.start_datetime).toUTC()
  const end = DateTime.fromISO(area.end_datetime).toUTC()
  const active = DateTime.utc() >= start

  return (
    <Polygon
      pane="markerPane"
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
      </Tooltip>
    </Polygon>
  )
}

export const AreaLayer = () => {
  const { data: areas } = usePollAreas()

  const level = useAppSelector(selectLevel)

  const levelFilter = (a: AreaBooking) =>
    (a.lower_limit ?? 0) <= level && level < (a.upper_limit ?? 999)
  const isActive = (a: AreaBooking) =>
    DateTime.fromISO(a.start_datetime).toUTC() <=
      DateTime.utc().plus(Duration.fromObject({ minutes: 30 })) &&
    DateTime.fromISO(a.end_datetime).toUTC() >= DateTime.utc()

  return (
    <LayerGroup>
      {areas
        ?.filter(levelFilter)
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
