import { useState } from "react"
import { useAppSelector } from "../app/hooks"
import {
  selectActiveFir,
  selectFirAllAerodromes,
} from "../services/configSlice"
import { FIR_SETTINGS } from "../app/config"
import { usePollMetarByIcaoCodes, xmc } from "../services/metarApi"
import { usePollTafByIcaoCodes } from "../services/tafApi"
import { Box, Button, Flex, Grid, Text } from "theme-ui"
import { usePollAtisByIcaoCodes } from "../services/atisApi"
import { sectorApi, selectAirports } from "../services/sectorApi"

const Wx = () => {
  const activeFir = useAppSelector(selectActiveFir)
  const firADs = useAppSelector(selectFirAllAerodromes)
  const [selectedAD, setSelectedAD] = useState(firADs[0])

  const { data: _s } = sectorApi.useGetQuery()
  const airports = useAppSelector(selectAirports)
  const vatglassesADs = Object.entries(airports)
    .filter(
      ([icaoCode, ad]) =>
        ad.topdown.length > 0 &&
        !firADs.includes(icaoCode) &&
        FIR_SETTINGS[activeFir].neighbourPrefixes.some((prefix) =>
          icaoCode.startsWith(prefix),
        ),
    )
    .map(([icaoCode]) => icaoCode)

  const aerodromes = [...firADs, ...vatglassesADs]
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
        padding: 2,
      }}
    >
      <Flex sx={{ flexDirection: "column", fontSize: 2 }}>
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
            {airports?.[selectedAD]?.callsign && (
              <Text variant="label">{airports?.[selectedAD]?.callsign}</Text>
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
