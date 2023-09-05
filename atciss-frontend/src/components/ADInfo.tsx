import { Box, Flex, Grid, Text, ThemeUIStyleObject } from "theme-ui"
import { useAppSelector } from "../app/hooks"
import { selectActiveEbg } from "../services/configSlice"
import { EBG_SETTINGS } from "../app/config"
import { usePollMetarByIcaoCodes } from "../services/metarApi"
import { usePollAtisByIcaoCodes } from "../services/atisApi"

export const ADinfo = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const activeEbg = useAppSelector(selectActiveEbg)
  const aerodromes: string[] = EBG_SETTINGS[activeEbg]?.aerodromes ?? []
  const { data: metars } = usePollMetarByIcaoCodes(aerodromes)
  const { data: atis } = usePollAtisByIcaoCodes(aerodromes)

  return (
    <Flex
      sx={{
        ...sx,
        flexDirection: "column",
        fontSize: 3,
        fontFamily: "monospace",
      }}
    >
      {aerodromes.map((ad) => {
        const qnh = metars?.[ad]?.qnh?.toFixed() ?? ""
        return (
          <Grid
            key={ad}
            sx={{
              gridTemplateColumns: "1fr 1fr",
              borderWidth: 1,
              borderColor: "primary",
              borderStyle: "solid",
            }}
          >
            <Box>
              <Text variant="primary">{ad}</Text>
            </Box>
            <Box>
              <Text variant="label">QNH:</Text> {qnh}
            </Box>
            <Box>
              <Text variant="label">ATIS:</Text> {atis?.[ad]?.atis_code ?? "-"}
            </Box>
            <Box>
              <Text variant="label">RWY:</Text>{" "}
              {atis?.[ad]?.runways_in_use?.join(" ") ?? "closed"}
            </Box>
          </Grid>
        )
      })}
    </Flex>
  )
}
