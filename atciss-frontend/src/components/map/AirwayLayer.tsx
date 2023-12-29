import { LayerGroup, Polyline, Popup, useMap, useMapEvent } from "react-leaflet"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { airwayApi, selectAirways } from "../../services/airwayApi"
import {
  selectAirwayLowerUpper,
  selectSelectedAirway,
  setSelectedAirway,
} from "../../services/mapSlice"
import { Box, Flex, Text } from "theme-ui"
import { useAppTheme } from "../../app/theme"
import { useState } from "react"

const levelFormat = (level: number, uom: "FL" | "FT") =>
  uom === "FL" ? `FL${level}` : `${level}ft`

export const AirwayLayer = () => {
  const lowerUpper = useAppSelector(selectAirwayLowerUpper)
  const { data: _a } = airwayApi.useGetQuery(lowerUpper)
  const airways = useAppSelector(selectAirways)
  const selectedAirway = useAppSelector(selectSelectedAirway)
  const dispatch = useAppDispatch()
  const theme = useAppTheme()
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
                : "#000000",
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
