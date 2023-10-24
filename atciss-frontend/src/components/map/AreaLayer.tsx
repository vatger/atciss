import { LayerGroup, Polygon, Tooltip } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import { selectLevel } from "../../services/mapSlice"
import { AreaBooking, usePollAreas } from "../../services/areaApi"
import { Box, Text } from "theme-ui"
import { z3 } from "../../app/utils"
import { DateTime, Duration } from "luxon"

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
        .map((area) => {
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
              key={`${area.name}-${area.lower_limit}-${area.upper_limit}`}
            >
              <Tooltip>
                <Box sx={{ fontSize: "1" }}>
                  <Text variant="label">{area.name}</Text>
                </Box>
                <Box sx={{ fontSize: "1" }}>
                  FL{z3(area.lower_limit ?? 0)}-FL
                  {z3(area.upper_limit ?? 660)}
                </Box>
                <Box sx={{ fontSize: "1" }}>
                  <Text
                    variant="label"
                    sx={{ color: active ? "#ff0000" : "#ff9900" }}
                  >
                    {active
                      ? `Active, deactivates ${end.toRelative()}`
                      : `Will be active ${start.toRelative()}`}
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
        })}
    </LayerGroup>
  )
}
