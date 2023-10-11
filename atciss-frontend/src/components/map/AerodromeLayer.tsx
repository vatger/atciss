import { LayerGroup, Tooltip } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import {
  sectorApi,
  selectAirport,
  selectAirportICAOs,
  selectPosition,
} from "../../services/sectorApi"
import { usePollControllers } from "../../services/controllerApi"
import { adApi, selectDfsAd } from "../../services/adApi"
import { CircleMarker } from "react-leaflet"
import { Box, Flex, Text } from "theme-ui"
import {
  selectMetar,
  usePollMetarByIcaoCodes,
  xmc,
} from "../../services/metarApi"
import { selectTaf, usePollTafByIcaoCodes } from "../../services/tafApi"
import { selectAtis, usePollAtisByIcaoCodes } from "../../services/atisApi"
import createCachedSelector from "re-reselect"
import { selectAirportController } from "../../services/activePositionSlice"

const selectAirportCoordinates = createCachedSelector(
  [selectAirport, selectDfsAd],
  (vatglassesAirport, dfsAd) =>
    vatglassesAirport?.coord ??
    (dfsAd ? [dfsAd.latitude, dfsAd.longitude] : null),
)((_state, icao) => icao)

const AerodromeMarker = ({ icao }: { icao: string }) => {
  const airport = useAppSelector((store) => selectAirport(store, icao))
  const owner = useAppSelector((store) => selectAirportController(store, icao))
  const position = useAppSelector((store) => selectPosition(store, owner))
  const metar = useAppSelector((store) => selectMetar(store, icao))
  const taf = useAppSelector((store) => selectTaf(store, icao))
  const atis = useAppSelector((store) => selectAtis(store, icao))
  const xmcState = metar ? xmc(metar) : null
  const coord = useAppSelector((store) => selectAirportCoordinates(store, icao))

  return (
    coord && (
      <CircleMarker
        center={coord}
        radius={5}
        key={icao}
        pane="markerPane"
        pathOptions={{
          fillOpacity: 0.6,
          weight: 1,
          color:
            xmcState == "LVP"
              ? "hotpink"
              : xmcState == "VMC"
              ? "green"
              : xmcState == "IMC"
              ? "darkred"
              : "darkblue",
        }}
      >
        <Tooltip>
          <Flex
            sx={{
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "2",
              fontSize: "2",
            }}
          >
            <Box>
              <Text variant="mapAd">{icao} </Text>
              {position && (
                <>
                  by{" "}
                  <Text variant="label">
                    {position.name} ({position.frequency})
                  </Text>
                </>
              )}
            </Box>
            {airport?.callsign && (
              <Text variant="label">{airport?.callsign}</Text>
            )}
          </Flex>
          {metar?.raw && (
            <Box sx={{ fontSize: "1", mt: 1 }}>
              <Text variant="label">METAR</Text>
              <pre>{metar?.raw?.replace(/.*?[A-Z]{4}\s/, "")}</pre>
            </Box>
          )}
          {taf && (
            <Box sx={{ fontSize: "1", mt: 1 }}>
              <Text variant="label">TAF</Text>
              <pre>{taf}</pre>
            </Box>
          )}
          {atis?.text_atis && (
            <Box sx={{ fontSize: "1", mt: 1 }}>
              <Text variant="label">ATIS</Text>
              <pre>{atis?.text_atis}</pre>
            </Box>
          )}
        </Tooltip>
      </CircleMarker>
    )
  )
}

export const AerodromeLayer = () => {
  usePollControllers()

  sectorApi.useGetQuery()
  const airports = useAppSelector(selectAirportICAOs)

  usePollMetarByIcaoCodes(airports)
  usePollTafByIcaoCodes(airports)
  usePollAtisByIcaoCodes(airports)
  adApi.useGetByIcaoCodesQuery(airports)

  return (
    <LayerGroup>
      {airports.map((icao) => (
        <AerodromeMarker key={icao} icao={icao} />
      ))}
    </LayerGroup>
  )
}
