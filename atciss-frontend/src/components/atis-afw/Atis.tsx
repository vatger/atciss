import { Text, Flex, ThemeUIStyleObject, Box } from "theme-ui"
import {
  Clouds,
  hpaToInhg,
  usePollMetarByIcaoCodes,
  xmc,
} from "../../services/metarApi"
import { usePollAtisByIcaoCodes } from "../../services/atisApi"
import { usePollAdByIcaoCodes } from "../../services/adApi"
import { DateTime } from "luxon"
import { z2, z3, z4 } from "../../app/utils"
import { useAppSelector } from "../../app/hooks"
import { AtisRow } from "./atis/AtisRow"
import { selectPageAtisAerodromes } from "../../services/atisAfwSlice"

const Atis = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const aerodromes = useAppSelector(selectPageAtisAerodromes)
  const { data: metars, isLoading: metarIsLoading } =
    usePollMetarByIcaoCodes(aerodromes)
  const { data: atis, isLoading: atisIsLoading } =
    usePollAtisByIcaoCodes(aerodromes)
  const { data: ads, isLoading: adIsLoading } = usePollAdByIcaoCodes(aerodromes)

  if (!metarIsLoading && metars && !atisIsLoading && !adIsLoading && ads) {
    const filteredAerodromes = aerodromes.filter((ad) => metars[ad] && ads[ad])

    return (
      <Flex
        sx={{
          ...sx,
          flexDirection: "column",
          gap: "2px",
          backgroundColor: "primary",
        }}
      >
        {filteredAerodromes.length ? (
          filteredAerodromes.map((aerodrome) => {
            const metar = metars[aerodrome]
            const obs = new Date(`${metar.time}`)
            const wind = metar.wind_dir !== null ? z3(metar.wind_dir) : "VRB"
            const wind_gust = metar.wind_gust ? `G${z2(metar.wind_gust)}` : ""
            const wind_from_to =
              metar?.wind_dir_from && metar.wind_dir_to
                ? `${z3(metar.wind_dir_from)}V${z3(metar.wind_dir_to)} `
                : ""
            const elevation = ads[aerodrome].elevation
            const qfe =
              elevation !== null
                ? metar.qnh - (12.017 * (elevation / 3.28084)) / 100
                : null

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
                  padding: 1,
                  flexDirection: "column",
                  flex: 1,
                  fontSize: 2,
                  fontFamily: "monospace",
                  backgroundColor: "background",
                }}
                key={aerodrome}
              >
                <AtisRow>
                  <Text variant="atisL" sx={{ fontWeight: "bold" }}>
                    {aerodrome}
                  </Text>
                  <Text variant="atisXL">
                    {atis?.[aerodrome]?.atis_code ?? "-"}
                  </Text>
                  <Text>
                    <Text variant="label">OBS: </Text>
                    {z2(obs.getUTCDate())}
                    {z2(obs.getUTCHours())}
                    {z2(obs.getUTCMinutes())}
                  </Text>
                  <Text variant="primary">{xmc(metar)}</Text>
                  <Text>
                    <Text variant="label">SR:</Text>{" "}
                    {DateTime.fromISO(ads[aerodrome].sunrise)
                      .toUTC()
                      .toFormat("HHmm")}
                  </Text>
                  <Text>
                    <Text variant="label">SS:</Text>{" "}
                    {DateTime.fromISO(ads[aerodrome].sunset)
                      .toUTC()
                      .toFormat("HHmm")}
                  </Text>
                </AtisRow>
                <AtisRow>
                  <Box>
                    <Text variant="label">Rwy: </Text>
                    <Text variant="atisL">
                      {atis?.[aerodrome]?.runways_in_use.join(" ")}
                    </Text>
                  </Box>
                  <Box>
                    <Text variant="label">TL: </Text>
                    <Text variant="atisL">{metar.tl}</Text>
                  </Box>
                  <Box>
                    <Text variant="label">WX-Type: </Text>
                    <Text sx={{ fontSize: 4 }}>METAR</Text>
                  </Box>
                </AtisRow>
                <Flex sx={{ gap: 1 }}>
                  <Text
                    variant="label"
                    sx={{ display: "block", flexShrink: 0 }}
                  >
                    Info:
                  </Text>
                  <Text
                    sx={{ flexGrow: 1, borderStyle: "inset", display: "block" }}
                  >
                    {atis?.[aerodrome]?.text_atis?.match(
                      /(EXPECT.*)\s(DEPARTURE\sRWYS|RUNWAYS? IN USE|AIRCRAFT WITH PARKING)/s,
                    )?.[1] ??
                      atis?.[aerodrome]?.text_atis ??
                      "Offline"}
                  </Text>
                </Flex>
                <AtisRow>
                  <Text>
                    <Text variant="label">Wind/Vis.:</Text> {wind}
                    {z2(metar.wind_speed)}
                    {wind_gust}KT {wind_from_to}
                  </Text>
                  <Text>/ {metar.vis.map((v) => z4(v)).join(" ")}</Text>
                </AtisRow>
                {!!metar.rvr.length && (
                  <AtisRow>
                    <Text variant="label">RVR:</Text>{" "}
                    {metar.rvr
                      .map((rvr) => `R${rvr.runway}/${rvr.low}${rvr.trend}`)
                      .join(" ")}
                  </AtisRow>
                )}
                <AtisRow>
                  <Text variant="label">Weather:</Text>{" "}
                  {metar.weather.join(" ")}
                </AtisRow>
                <AtisRow>
                  <Text>
                    <Text variant="label">Temp/Dew:</Text> {z2(metar.temp)}/
                    {z2(metar.dewpt)}
                  </Text>
                  <Box>
                    <Text>
                      <Text variant="label">Clouds:</Text> {clouds}
                    </Text>
                  </Box>
                </AtisRow>
                <AtisRow>
                  <Text variant="label">QNH:</Text>
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
                      {metar.qnh.toFixed(0)}
                    </Text>
                    /{hpaToInhg(metar.qnh).toFixed(2)}
                  </Text>
                  {qfe !== null && (
                    <Text>
                      <Text variant="label">QFE:</Text> {qfe.toFixed(0)}/
                      {hpaToInhg(qfe).toFixed(2)}
                    </Text>
                  )}
                </AtisRow>
                <AtisRow>
                  <Text variant="label">Trend:</Text> {metar.trend}
                </AtisRow>
              </Flex>
            )
          })
        ) : (
          <Box sx={{ backgroundColor: "background", flex: 1 }} />
        )}
      </Flex>
    )
  } else {
    return <Box sx={{ ...sx, backgroundColor: "background", flex: 1 }} />
  }
}

export { Atis }
