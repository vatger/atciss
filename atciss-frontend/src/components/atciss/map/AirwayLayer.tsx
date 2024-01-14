import { useAtcissTheme } from "app/atciss/theme"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { useState } from "react"
import { LayerGroup, Polyline, Popup, useMap, useMapEvent } from "react-leaflet"
import { selectAirways } from "services/airwayApi"
import { api } from "services/api"
import {
  selectAirwayLowerUpper,
  selectSelectedAirway,
  setSelectedAirway,
} from "services/mapSlice"
import { Box, Flex, Text } from "theme-ui"

const levelFormat = (level: number, uom: "FL" | "FT") =>
  uom === "FL" ? `FL${level}` : `${level}ft`

export const AirwayLayer = () => {
  const lowerUpper = useAppSelector(selectAirwayLowerUpper)
  api.useAirwaysQuery(lowerUpper)
  const airways = useAppSelector(selectAirways)
  const selectedAirway = useAppSelector(selectSelectedAirway)
  const dispatch = useAppDispatch()
  const theme = useAtcissTheme()
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  useMapEvent("zoomend", () => setZoom(map.getZoom()))

  return (
    <LayerGroup>
      {airways.map((airway) => (
        <Polyline
          key={airway.id}
          positions={airway.curve_extent}
          pathOptions={{
            weight:
              (selectedAirway == airway.airway_id ? 3 : 1) * zoom > 8 ? 3 : 1,
            color:
              selectedAirway == airway.airway_id
                ? theme.colors.primary
                : theme.colors.text,
          }}
          eventHandlers={{
            click: () => {
              dispatch(setSelectedAirway(airway.airway_id))
            },
            popupclose: () => {
              dispatch(setSelectedAirway(null))
            },
          }}
          pane="shadowPane"
        >
          <Popup>
            <Flex
              sx={{
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "2",
                fontSize: "2",
              }}
            >
              <Text variant="mapAd">
                {airway.airway.designatorPrefix}
                {airway.airway.designatorSecondLetter}
                {airway.airway.designatorNumber}
              </Text>
            </Flex>
            <Box sx={{ fontSize: "1", mt: 1 }}>
              {levelFormat(airway.lower_limit, airway.lower_limit_uom)}-
              {levelFormat(airway.upper_limit, airway.upper_limit_uom)}
            </Box>
            <Box sx={{ fontSize: "1", mt: 1 }}>
              {airway.start.designator}-{airway.end.designator}
            </Box>
            <Box sx={{ fontSize: "1", mt: 1 }}>{airway.length}nm</Box>
          </Popup>
        </Polyline>
      ))}
    </LayerGroup>
  )
}
