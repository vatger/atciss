import { LayerGroup, Polyline, Popup } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import { airwayApi, selectAirways } from "../../services/airwayApi"
import { selectAirwayLowerUpper } from "../../services/mapSlice"
import { Box, Flex, Text } from "theme-ui"

const levelFormat = (level: number, uom: "FL" | "FT") =>
  uom === "FL" ? `FL${level}` : `${level}ft`

export const AirwayLayer = () => {
  const lowerUpper = useAppSelector(selectAirwayLowerUpper)
  const { data: _a } = airwayApi.useGetQuery(lowerUpper)
  const airways = useAppSelector(selectAirways)

  return (
    <LayerGroup>
      {airways.map((airway) => (
        <Polyline
          key={airway.id}
          positions={airway.curve_extent}
          pathOptions={{ weight: 1, color: "#000000" }}
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
