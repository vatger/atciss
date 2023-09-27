import { LayerGroup, Tooltip } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import {
  selectActivePositions,
  selectSyncedToOnline,
} from "../../services/activePositionSlice"
import { sectorApi } from "../../services/airspaceApi"
import { usePollControllers } from "../../services/controllerApi"
import { selectActiveEbg } from "../../services/configSlice"
import { adApi } from "../../services/adApi"
import { EBG_SETTINGS } from "../../app/config"
import { CircleMarker } from "react-leaflet"
import { Box, Flex, Text } from "theme-ui"
import { usePollMetarByIcaoCodes, xmc } from "../../services/metarApi"
import { usePollTafByIcaoCodes } from "../../services/tafApi"
import { usePollAtisByIcaoCodes } from "../../services/atisApi"

export const AerodromeLayer = () => {
  const { data } = sectorApi.useGetByRegionQuery()
  usePollControllers()

  const activeEbg = useAppSelector(selectActiveEbg)
  const syncedToOnline = useAppSelector(selectSyncedToOnline)

  const vatglassesADs = Object.entries(data?.airports ?? {})
    .filter(([_, ad]) => ad.topdown.length > 0)
    .map(([ad]) => ad)
  const ebgADs = [
    ...EBG_SETTINGS[activeEbg].majorAerodromes,
    ...EBG_SETTINGS[activeEbg].aerodromes,
    ...EBG_SETTINGS[activeEbg].minorAerodromes,
  ]

  const allADs = [...new Set([...ebgADs, ...vatglassesADs])]

  const { data: aerodromes } = adApi.useGetByIcaoCodesQuery(
    ebgADs.filter((ad) => ad.startsWith("ED") && !vatglassesADs.includes(ad)),
  )
  const { data: metars } = usePollMetarByIcaoCodes(allADs)
  const { data: tafs } = usePollTafByIcaoCodes(allADs)
  const { data: atiss } = usePollAtisByIcaoCodes(allADs)
  const activePositions = useAppSelector(selectActivePositions)

  const getCoord = (ad: string) =>
    data?.airports?.[ad]?.coord ??
    (aerodromes?.[ad]
      ? [aerodromes[ad].latitude, aerodromes[ad].longitude]
      : null)

  return (
    <LayerGroup>
      {allADs.map((ad) => {
        const station = data?.airports?.[ad]?.topdown?.find(
          (pos) =>
            // TODO don't ignore rwy-dependent topdown
            typeof pos === "string" &&
            activePositions[pos]?.[syncedToOnline ? "online" : "manual"],
        )
        const metar = metars?.[ad]
        const taf = tafs?.[ad]
        const atis = atiss?.[ad]
        const xmcState = metar ? xmc(metar) : null
        const coord = getCoord(ad)
        return (
          coord && (
            <CircleMarker
              center={coord}
              radius={5}
              key={ad}
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
                    <Text variant="mapAd">{ad} </Text>
                    {typeof station === "string" ? (
                      <>
                        by <Text variant="label">{station}</Text>
                      </>
                    ) : (
                      ""
                    )}
                  </Box>
                  {data?.airports?.[ad]?.callsign && (
                    <Text variant="label">
                      {data?.airports?.[ad]?.callsign}
                    </Text>
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
      })}
    </LayerGroup>
  )
}
