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
import { createCachedSelector } from "re-reselect"
import {
  selectAirportControllers,
  selectAirportTopdownController,
  selectControllerFromPosition,
} from "../../services/activePositionSlice"

const selectAirportCoordinates = createCachedSelector(
  selectAirport,
  selectDfsAd,
  (vatglassesAirport, dfsAd) =>
    vatglassesAirport?.coord ??
    (dfsAd ? [dfsAd.arp_location[0], dfsAd.arp_location[1]] : null),
)((_state, icao) => icao)

const AerodromeMarker = ({ icao }: { icao: string }) => {
  const airport = useAppSelector((store) => selectAirport(store, icao))
  const topdownOwner = useAppSelector((store) =>
    selectAirportTopdownController(store, icao),
  )
  const aerodromeControllers = useAppSelector((store) =>
    selectAirportControllers(store, icao),
  )
  const topdownPosition = useAppSelector((store) =>
    selectPosition(store, topdownOwner),
  )
  const topdownController = useAppSelector((store) =>
    selectControllerFromPosition(store, topdownOwner),
  )
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
          fillOpacity: aerodromeControllers.length ? 0.9 : 0.2,
          weight: aerodromeControllers.length || topdownController ? 3 : 1,
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
            <Text variant="mapAd">{icao}</Text>
            {airport?.callsign && (
              <Text variant="label">{airport?.callsign}</Text>
            )}
          </Flex>
          {aerodromeControllers.length
            ? aerodromeControllers.map((c) => (
                <Box key={c.callsign}>
                  <Text variant="label">{c.callsign}</Text> {c.name} ({c.cid},{" "}
                  {c.frequency})
                </Box>
              ))
            : topdownPosition &&
              topdownController && (
                <>
                  <Text variant="label">{topdownPosition.name}</Text>{" "}
                  {topdownController.name} ({topdownController.cid},{" "}
                  {topdownPosition.frequency})
                </>
              )}
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
  const { data: _c } = usePollControllers()

  const { data: _s } = sectorApi.useGetQuery()
  const airports = useAppSelector(selectAirportICAOs)

  const { data: _m } = usePollMetarByIcaoCodes(airports)
  const { data: _t } = usePollTafByIcaoCodes(airports)
  const { data: _a } = usePollAtisByIcaoCodes(airports)
  const { data: _ad } = adApi.useGetByIcaoCodesQuery(airports)

  return (
    <LayerGroup>
      {airports.map((icao) => (
        <AerodromeMarker key={icao} icao={icao} />
      ))}
    </LayerGroup>
  )
}
