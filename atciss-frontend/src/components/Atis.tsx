import { Text, Flex, ThemeUIStyleObject, Box } from "theme-ui"
import {
  Clouds,
  hpaToInhg,
  tl,
  usePollMetarByIcaoCode,
  xmc,
} from "../services/metarApi"
import { ReactNode } from "react"

const AERODROME = "EDDM"

const zn = (n: number) => (x: number) => String(x).padStart(n, "0")
const z2 = zn(2)
const z3 = zn(3)
const z4 = zn(4)

const AtisRow = ({
  children,
  sx,
}: {
  children: ReactNode
  sx?: ThemeUIStyleObject
}) => (
  <Flex sx={{ justifyContent: "space-between", alignItems: "baseline", ...sx }}>
    {children}
  </Flex>
)

const Atis = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const { data: metar, isLoading, error } = usePollMetarByIcaoCode(AERODROME)

  if (!isLoading && metar) {
    const obs = new Date(`${metar.time}`)
    const wind = metar.wind_dir ? z3(metar.wind_dir) : "VRB"
    const wind_gust = metar.wind_gust ? `G${z2(metar.wind_gust)}` : ""
    const wind_from_to =
      metar?.wind_dir_from && metar.wind_dir_to
        ? `${z3(metar.wind_dir_from)}V${z3(metar.wind_dir_to)} `
        : ""

    return (
      <Flex
        sx={{
          ...sx,
          flexDirection: "column",
          fontSize: 3,
          fontFamily: "monospace",
        }}
      >
        <AtisRow>
          <Text variant="atisL" sx={{ fontWeight: "bold" }}>
            {AERODROME}
          </Text>
          <Text variant="atisXL">X</Text>
          <Text>
            OBS: {z2(obs.getUTCDay())}
            {z2(obs.getUTCHours())}
            {z2(obs.getUTCMinutes())}
          </Text>
          <Text variant="primary">{xmc(metar)}</Text>
          <Text>SR: 0000</Text>
          <Text>SS: 2359</Text>
        </AtisRow>
        <AtisRow>
          <Box>
            Rwy: <Text variant="atisL">18L 18R</Text>
          </Box>
          <Box>
            TL: <Text variant="atisL">{tl(metar)}</Text>
          </Box>
          <Box>
            WX-Type: <Text sx={{ fontSize: 5 }}>METAR</Text>
          </Box>
        </AtisRow>
        <Text sx={{ flexGrow: 1, borderStyle: "inset" }}>
          Info: INDEPENDENT DEPENDENT RNAV APPROACHES IN PROGRESS
        </Text>
        <AtisRow>
          <Text>
            Wind/Vis.: {wind}
            {z2(metar.wind_speed)}
            {wind_gust}KT {wind_from_to}
          </Text>
          <Text>/ {z4(metar.vis)}</Text>
        </AtisRow>
        <AtisRow>Weather: +TSGRRA</AtisRow>
        <AtisRow>
          <Text>
            Temp/Dew: {z2(metar.temp)}/{z2(metar.dewpt)}
          </Text>
          <Box>
            <Text>Clouds: </Text>
            <Text>
              {metar.clouds.map(
                (clouds: Clouds) =>
                  `${clouds.cover}${clouds.height ?? "///"}${
                    clouds.type ?? ""
                  }`,
              )}
            </Text>
          </Box>
        </AtisRow>
        <AtisRow>
          <Text>QNH:</Text>
          <Text>
            <Text variant="atisL">{z4(metar.qnh)}</Text>/
            {hpaToInhg(metar.qnh).toFixed(2)}
          </Text>
          <Text>QFE: {z4(12)}/27.65</Text>
        </AtisRow>
        <AtisRow>Trend: {metar.trend}</AtisRow>
      </Flex>
    )
  } else {
    return <>{error}</>
  }
}

export { Atis }
