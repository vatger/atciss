import { Box, Flex, Grid, Text, ThemeUIStyleObject } from "theme-ui"
import { useAppSelector } from "../../app/hooks"
import { usePollMetarByIcaoCodes } from "../../services/metarApi"
import { usePollAtisByIcaoCodes } from "../../services/atisApi"
import { z2, z3 } from "../../app/utils"
import { selectPageAerodromes } from "../../services/atisAfwSlice"

const Aerodrome = ({ icao }: { icao: string }) => {
  const { data: metarData } = usePollMetarByIcaoCodes([icao])
  const { data: atisData } = usePollAtisByIcaoCodes([icao])
  const metar = metarData?.[icao]
  const atis = atisData?.[icao]
  const qnh = metar?.qnh?.toFixed() ?? ""
  const wind = metar?.wind_dir ? z3(metar.wind_dir) : "VRB"
  const wind_gust = metar?.wind_gust ? `G${z2(metar.wind_gust)}` : ""
  const wind_from_to =
    metar?.wind_dir_from && metar?.wind_dir_to
      ? `${z3(metar.wind_dir_from)}V${z3(metar.wind_dir_to)} `
      : ""
  return (
    <Grid
      sx={{
        gridTemplateColumns: "1fr 1fr 1fr",
        backgroundColor: "background",
        gap: 0,
        padding: 1,
      }}
    >
      <Box>
        <Text variant="primaryLabel">{icao}</Text>
      </Box>
      <Box>
        <Text variant="label">ATIS:</Text> {atis?.atis_code ?? "-"}
      </Box>
      <Box>
        <Text variant="label">RWY:</Text>{" "}
        {atis?.runways_in_use?.join(" ") ?? "closed"}
      </Box>
      {metar && (
        <>
          <Box>
            <Text variant="label">QNH:</Text> {qnh}
          </Box>
          <Box sx={{ gridColumn: "span 2" }}>
            <Text variant="label">Wind:</Text> {wind}
            {z2(metar?.wind_speed ?? 0)}
            {wind_gust}KT {wind_from_to}
          </Box>
        </>
      )}
    </Grid>
  )
}

export const ADinfo = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const aerodromes = useAppSelector(selectPageAerodromes)

  return (
    <Flex
      sx={{
        ...sx,
        flexDirection: "column",
        fontSize: 1,
        fontFamily: "monospace",
        gap: "2px",
        backgroundColor: "primary",
      }}
    >
      {aerodromes.map((ad) => (
        <Aerodrome key={ad} icao={ad} />
      ))}
      <Box sx={{ height: "100%", backgroundColor: "background" }}></Box>
    </Flex>
  )
}
