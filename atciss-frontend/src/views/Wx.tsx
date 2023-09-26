import { useState } from "react"
import { useAppSelector } from "../app/hooks"
import { selectActiveEbg } from "../services/configSlice"
import { EBG_SETTINGS } from "../app/config"
import { usePollMetarByIcaoCodes, xmc } from "../services/metarApi"
import { usePollTafByIcaoCodes } from "../services/tafApi"
import { sectorApi } from "../services/airspaceApi"
import { Box, Button, Flex, Grid, Text } from "theme-ui"
import { usePollAtisByIcaoCodes } from "../services/atisApi"

const Wx = () => {
  const activeEbg = useAppSelector(selectActiveEbg)
  const ebgADs = [
    ...EBG_SETTINGS[activeEbg].majorAerodromes,
    ...EBG_SETTINGS[activeEbg].aerodromes,
    ...EBG_SETTINGS[activeEbg].minorAerodromes,
    ...EBG_SETTINGS[activeEbg].relevantAerodromes,
  ]

  const [selectedAD, setSelectedAD] = useState(ebgADs[0])

  const { data } = sectorApi.useGetByRegionQuery()
  const vatglassesADs = Object.entries(data?.airports ?? {})
    .filter(
      ([icaoCode, ad]) =>
        ad.topdown.length > 0 &&
        !ebgADs.includes(icaoCode) &&
        EBG_SETTINGS[activeEbg].wxPrefixes.some((prefix) =>
          icaoCode.startsWith(prefix),
        ),
    )
    .map(([icaoCode]) => icaoCode)

  const aerodromes = [...ebgADs, ...vatglassesADs]
  const { data: metars } = usePollMetarByIcaoCodes(aerodromes)
  const { data: tafs } = usePollTafByIcaoCodes(aerodromes)
  const { data: atiss } = usePollAtisByIcaoCodes(aerodromes)
  const metar = metars?.[selectedAD]
  const taf = tafs?.[selectedAD]
  const atis = atiss?.[selectedAD]
  const xmcState = metar ? xmc(metar) : null

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Flex sx={{ flexDirection: "column" }}>
        <Flex
          sx={{
            alignItems: "baseline",
            gap: "4",
          }}
        >
          <Box>
            <Text variant="mapAd">{selectedAD}</Text>
          </Box>
          <Box>
            {data?.airports?.[selectedAD]?.callsign && (
              <Text variant="label">
                {data?.airports?.[selectedAD]?.callsign}
              </Text>
            )}
          </Box>
          <Box>
            <Text variant="label">{xmcState}</Text>
          </Box>
        </Flex>
        {atis && (
          <Box sx={{ mt: 3 }}>
            <Text variant="label">ATIS</Text>
            <Box sx={{ p: 2, mt: 2, borderStyle: "inset" }}>
              <pre>{atis?.text_atis}</pre>
            </Box>
          </Box>
        )}
        {metar?.raw && (
          <Box sx={{ mt: 3 }}>
            <Text variant="label">METAR</Text>
            <Box sx={{ p: 2, mt: 2, borderStyle: "inset" }}>
              <pre>{metar?.raw?.replace(/.*?[A-Z]{4}\s/, "")}</pre>
            </Box>
          </Box>
        )}
        {taf && (
          <Box sx={{ mt: 3 }}>
            <Text variant="label">TAF</Text>
            <Box sx={{ p: 2, mt: 2, borderStyle: "inset" }}>
              <pre>{taf}</pre>
            </Box>
          </Box>
        )}
      </Flex>
      <Grid
        sx={{
          gridTemplateColumns: "repeat(auto-fill, minmax(5em, 1fr))",
          mt: 4,
        }}
      >
        {aerodromes
          .filter((ad) => metars?.[ad] || tafs?.[ad])
          .map((ad) => (
            <Button key={ad} onClick={() => setSelectedAD(ad)}>
              {ad}
            </Button>
          ))}
      </Grid>
    </Flex>
  )
}

export { Wx }
