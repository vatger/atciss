import { useState } from "react"
import { useAppSelector } from "../app/hooks"
import {
  selectFirAllAerodromes,
  selectNeighbourPrefixes,
} from "../services/configSlice"
import {
  selectMetar,
  selectRawMetar,
  usePollMetarByIcaoCodes,
  usePollRawMetar,
  xmc,
} from "../services/metarApi"
import { selectTaf, usePollTafByIcaoCodes } from "../services/tafApi"
import { Box, Button, Flex, Grid, Text } from "theme-ui"
import { selectAtis, usePollAtisByIcaoCodes } from "../services/atisApi"
import { sectorApi, selectAirport, selectAirports } from "../services/sectorApi"

const AerodromeWx = ({ ad }: { ad: string }) => {
  const { data: _m } = usePollMetarByIcaoCodes([ad])
  const { data: _rm } = usePollRawMetar(ad)
  const { data: _t } = usePollTafByIcaoCodes([ad])
  const { data: _a } = usePollAtisByIcaoCodes([ad])

  const aerodrome = useAppSelector((store) => selectAirport(store, ad))
  const atis = useAppSelector((store) => selectAtis(store, ad))
  const taf = useAppSelector((store) => selectTaf(store, ad))
  const metar = useAppSelector((store) => selectMetar(store, ad))
  const rawMetar = useAppSelector((store) => selectRawMetar(store, ad))
  const xmcState = metar ? xmc(metar) : null

  return (
    <Flex sx={{ flexDirection: "column", fontSize: 2 }}>
      <Flex
        sx={{
          alignItems: "baseline",
          gap: "4",
        }}
      >
        <Box>
          <Text variant="mapAd">{ad}</Text>
        </Box>
        <Box>
          {aerodrome?.callsign && (
            <Text variant="label">{aerodrome.callsign}</Text>
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
      {rawMetar && (
        <Box sx={{ mt: 3 }}>
          <Text variant="label">METAR</Text>
          <Box sx={{ p: 2, mt: 2, borderStyle: "inset" }}>
            <pre>{rawMetar.replace(/.*?[A-Z]{4}\s/, "")}</pre>
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
  )
}

const Wx = () => {
  const firADs = useAppSelector(selectFirAllAerodromes)
  const neighbourPrefixes = useAppSelector(selectNeighbourPrefixes)
  const [selectedAD, setSelectedAD] = useState(firADs[0])

  const { data: _s } = sectorApi.useGetQuery()
  const airports = useAppSelector(selectAirports)
  const vatglassesADs = Object.entries(airports)
    .filter(
      ([icaoCode, ad]) =>
        ad.topdown.length > 0 &&
        !firADs.includes(icaoCode) &&
        neighbourPrefixes.some((prefix) => icaoCode.startsWith(prefix)),
    )
    .map(([icaoCode]) => icaoCode)

  const aerodromes = [...firADs, ...vatglassesADs]

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        padding: 2,
      }}
    >
      <AerodromeWx ad={selectedAD} />
      <Grid
        sx={{
          gridTemplateColumns: "repeat(auto-fill, minmax(5em, 1fr))",
          mt: 4,
        }}
      >
        {aerodromes.map((ad) => (
          <Button key={ad} onClick={() => setSelectedAD(ad)}>
            {ad}
          </Button>
        ))}
      </Grid>
    </Flex>
  )
}

export { Wx }
