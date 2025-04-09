import { createSelector } from "@reduxjs/toolkit"
import { useAppSelector } from "app/hooks"
import { Tooltip } from "components/atciss/map/Tooltip"
import { CircleMarker, LayerGroup } from "react-leaflet"
import {
  selectAirportControllers,
  selectAirportTopdownController,
  selectControllerFromPosition,
} from "services/activePositions"
import {
  selectAirport,
  selectAirportICAOs,
  selectDfsAd,
} from "services/aerodrome"
import { api } from "services/api"
import { selectAtis, usePollAtisByIcaoCodes } from "services/atisApi"
import { usePollControllers } from "services/controllerApi"
import { selectMetar, usePollMetarByIcaoCodes, xmc } from "services/metarApi"
import { selectPosition } from "services/sectorApi"
import { selectTaf, usePollTafByIcaoCodes } from "services/tafApi"
import { Box, Flex, Text } from "theme-ui"

const selectAirportCoordinates = createSelector(
  selectAirport,
  selectDfsAd,
  (vatglassesAirport, dfsAd) =>
    vatglassesAirport?.coord ??
    (dfsAd ? [dfsAd.arp_location[0], dfsAd.arp_location[1]] : null),
)

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
  const xmcState = metar?.current ? xmc(metar.current) : null
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
              fontFamily: "body",
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
          {metar?.current?.raw && (
            <Box sx={{ fontSize: "1", mt: 1 }}>
              <Text variant="label">METAR</Text>
              <pre>{metar?.current?.raw?.replace(/.*?[A-Z]{4}\s/, "")}</pre>
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
              <Flex
                sx={{
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "2",
                }}
              >
                <Text variant="label">
                  ATIS
                  {atis.runways_in_use.length > 0 &&
                    ` (${atis.runways_in_use.join(", ")})`}
                </Text>
                <Text>
                  {atis.name} ({atis.cid}, {atis.frequency})
                </Text>
              </Flex>
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

  api.useSectorsQuery()
  const airports = useAppSelector(selectAirportICAOs)

  usePollMetarByIcaoCodes(airports)
  usePollTafByIcaoCodes(airports)
  usePollAtisByIcaoCodes(airports)
  api.useAerodromesByIcaosQuery(airports)

  return (
    <LayerGroup>
      {airports.map((icao) => (
        <AerodromeMarker key={icao} icao={icao} />
      ))}
    </LayerGroup>
  )
}
