import { Text, Flex, ThemeUIStyleObject, Box } from "theme-ui"
import {
  Clouds,
  hpaToInhg,
  tl,
  usePollMetarByIcaoCode,
  xmc,
} from "../services/metarApi"
import { ReactNode } from "react"
import { usePollAtisByIcaoCode } from "../services/atisApi"
import { useSearchParams } from "react-router-dom"

const DEFAULT_AERODROME = "EDDM"

const zn = (n: number) => (x: number | string) => String(x).padStart(n, "0")
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
  const [query] = useSearchParams()
  const aerodrome = query.get("icao") ?? DEFAULT_AERODROME
  const {
    data: metar,
    isLoading: metarIsLoading,
    error: metarError,
  } = usePollMetarByIcaoCode(aerodrome)
  const {
    data: atis,
    isLoading: atisIsLoading,
    error: atisError,
  } = usePollAtisByIcaoCode(aerodrome)

  if (!metarIsLoading && metar && !atisIsLoading) {
    const obs = new Date(`${metar.time}`)
    const wind = metar.wind_dir !== null ? z3(metar.wind_dir) : "VRB"
    const wind_gust = metar.wind_gust ? `G${z2(metar.wind_gust)}` : ""
    const wind_from_to =
      metar?.wind_dir_from && metar.wind_dir_to
        ? `${z3(metar.wind_dir_from)}V${z3(metar.wind_dir_to)} `
        : ""

    const clouds =
      metar.clouds.length === 0
        ? "CAVOK"
        : metar.clouds
            .map((clouds: Clouds) =>
              ["NCD", "NSC"].includes(clouds.cover)
                ? clouds.cover
                : `${clouds.cover}${
                    clouds.height ? z3(clouds.height / 100) : "///"
                  }${clouds.type ?? ""}`,
            )
            .join(" ")

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
            {aerodrome}
          </Text>
          <Text variant="atisXL">{atis?.atis_code ?? "-"}</Text>
          <Text>
            <Text variant="atisLabel">OBS: </Text>
            {z2(obs.getUTCDate())}
            {z2(obs.getUTCHours())}
            {z2(obs.getUTCMinutes())}
          </Text>
          <Text variant="primary">{xmc(metar)}</Text>
          <Text>{/*<Text variant="atisLabel">SR:</Text> 0000*/}</Text>
          <Text>{/*<Text variant="atisLabel">SS:</Text> 2359*/}</Text>
        </AtisRow>
        <AtisRow>
          <Box>
            <Text variant="atisLabel">Rwy: </Text>
            <Text variant="atisL">{atis?.runways_in_use.join(" ")}</Text>
          </Box>
          <Box>
            <Text variant="atisLabel">TL: </Text>
            <Text variant="atisL">{tl(metar)}</Text>
          </Box>
          <Box>
            <Text variant="atisLabel">WX-Type: </Text>
            <Text sx={{ fontSize: 5 }}>METAR</Text>
          </Box>
        </AtisRow>
        <Flex sx={{ flexGrow: 1, gap: 1 }}>
          <Text variant="atisLabel" sx={{ display: "block", flexShrink: 0 }}>
            Info:
          </Text>
          <Text sx={{ flexGrow: 1, borderStyle: "inset", display: "block" }}>
            {atis?.text_atis ?? "Offline"}
          </Text>
        </Flex>
        <AtisRow>
          <Text>
            <Text variant="atisLabel">Wind/Vis.:</Text> {wind}
            {z2(metar.wind_speed)}
            {wind_gust}KT {wind_from_to}
          </Text>
          <Text>/ {z4(metar.vis)}</Text>
        </AtisRow>
        <AtisRow>
          <Text variant="atisLabel">Weather:</Text> {metar.weather.join(" ")}
        </AtisRow>
        <AtisRow>
          <Text>
            <Text variant="atisLabel">Temp/Dew:</Text> {z2(metar.temp)}/
            {z2(metar.dewpt)}
          </Text>
          <Box>
            <Text>
              <Text variant="atisLabel">Clouds:</Text> {clouds}
            </Text>
          </Box>
        </AtisRow>
        <AtisRow>
          <Text variant="atisLabel">QNH:</Text>
          <Text>
            <Text
              variant="atisL"
              sx={{
                borderColor: "red",
                borderWidth: 2,
                paddingX: 4,
                paddingY: 1,
                borderStyle: "solid",
              }}
            >
              {z4(metar.qnh.toFixed(0))}
            </Text>
            /{hpaToInhg(metar.qnh).toFixed(2)}
          </Text>
          <Text>
            {/*<Text variant="atisLabel">QFE:</Text> {z4(12)}/27.65*/}
          </Text>
        </AtisRow>
        <AtisRow>
          <Text variant="atisLabel">Trend:</Text> {metar.trend}
        </AtisRow>
      </Flex>
    )
  } else {
    return metarError?.data?.detail
      ? metarError.data.detail
      : metarIsLoading
      ? "Loading..."
      : "Unknown Error"
  }
}

export { Atis }
