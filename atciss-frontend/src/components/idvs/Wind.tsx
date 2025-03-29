import { useAppDispatch, useAppSelector } from "app/hooks"
import { z3 } from "app/utils"
import { XmSelect } from "components/atciss/XmSelect"
import { InfoBox } from "components/idvs/InfoBox"
import {
  selectAerodromesWithPrefixes,
  selectIdvsAerodromes,
} from "services/aerodrome"
import { api } from "services/api"
import { selectAtis, usePollAtisByIcaoCodes } from "services/atisApi"
import {
  selectActiveAerodrome,
  selectRunwayDirection,
  setActiveAerodrome,
} from "services/idvsSlice"
import { selectMetar, usePollMetarByIcaoCodes, xmc } from "services/metarApi"
import { Box, Button, Flex, Grid, Text } from "theme-ui"
import { AnalogWindRose } from "./AnalogWindRose"
import { AD_SETUP } from "app/config"

const AD_PREFIXES = ["ED", "ET"]

const WindBox = ({ id }: { id: number }) => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollAtisByIcaoCodes([aerodrome])
  const runway = useAppSelector((store) => selectRunwayDirection(store, id))
  const metar = useAppSelector((store) => selectMetar(store, aerodrome))

  const angle_rad =
    metar &&
    runway &&
    metar.wind_dir !== null &&
    runway.magnetic_bearing !== null
      ? ((metar.wind_dir - runway.magnetic_bearing) * Math.PI) / 180
      : null
  const cross =
    angle_rad && metar && metar.wind_speed
      ? Math.abs(metar.wind_speed * Math.sin(angle_rad))
      : null
  const head =
    angle_rad && metar && metar.wind_speed
      ? metar.wind_speed * Math.cos(angle_rad)
      : null

  return (
    runway &&
    metar && (
      <Flex
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
          borderWidth: "3px",
          borderStyle: "groove",
          borderColor: "brightshadow",
          padding: 1,
        }}
      >
        <InfoBox sx={{ pr: 0 }}>
          <AnalogWindRose metar={metar} />
        </InfoBox>
        <Flex
          sx={{
            flexDirection: "column",
            alignItems: "center",
            flexGrow: 9,
          }}
        >
          <Box sx={{ fontSize: 5 }}>{runway?.designator}</Box>
          <InfoBox
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "flex-end",
            }}
          >
            {metar.wind_dir_from && (
              <>
                <Text sx={{ fontSize: 4 }}>{metar.wind_dir_from}</Text>
                <Text sx={{ fontSize: 4 }}>&#9664;</Text>
              </>
            )}
            <Text sx={{ fontSize: 6, textAlign: "center" }}>
              {metar.wind_dir ? z3(metar.wind_dir) : "VRB"}
            </Text>
            {metar.wind_dir_to && (
              <>
                <Text sx={{ fontSize: 4 }}>&#9654;</Text>
                <Text sx={{ fontSize: 4 }}>{metar.wind_dir_to}</Text>
              </>
            )}
          </InfoBox>
          <InfoBox
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "flex-end",
            }}
          >
            {metar.wind_gust && (
              <>
                <Text sx={{ fontSize: 4 }}>{metar.wind_speed}</Text>
                <Text sx={{ fontSize: 4 }}>&#9660;</Text>
              </>
            )}
            <Text sx={{ fontSize: 6, textAlign: "center" }}>
              {metar.wind_speed}
            </Text>
            {metar.wind_gust && (
              <>
                <Text sx={{ fontSize: 4 }}>&#9650;</Text>
                <Text sx={{ fontSize: 4 }}>{metar.wind_gust}</Text>
              </>
            )}
          </InfoBox>
          <Flex
            sx={{ mt: 2, gap: 2, alignItems: "baseline", alignSelf: "end" }}
          >
            <Box>{runway?.designator}:</Box>
            <Box>Head</Box>
            <InfoBox>{head?.toFixed(0) ?? "-"}</InfoBox>
            <Box>Cross</Box>
            <InfoBox>{cross?.toFixed(0) ?? "-"}</InfoBox>
          </Flex>
        </Flex>
      </Flex>
    )
  )
}

const AerodromeSelect = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  api.useAerodromesByPrefixesQuery(AD_PREFIXES)
  const icaos = Object.keys(
    useAppSelector((store) => selectAerodromesWithPrefixes(store, AD_PREFIXES)),
  )
  usePollMetarByIcaoCodes(icaos, { skip: !icaos.length })
  const metarIcaos = useAppSelector((store) =>
    selectIdvsAerodromes(store, AD_PREFIXES),
  )
  const dispatch = useAppDispatch()

  return (
    <XmSelect
      onChange={(e) => dispatch(setActiveAerodrome(e.target.value))}
      value={aerodrome}
      sx={{ fontSize: 5, textAlign: "center" }}
    >
      {metarIcaos.map((ad) => (
        <option key={ad}>{ad}</option>
      ))}
    </XmSelect>
  )
}

export const Wind = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  usePollAtisByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  const metar = useAppSelector((store) => selectMetar(store, aerodrome))
  const atis = useAppSelector((store) => selectAtis(store, aerodrome))
  const splitAtis = AD_SETUP?.[aerodrome]?.splitATIS || false

  return (
    <Grid
      sx={{
        justifyContent: "space-between",
        gridTemplateColumns: "3fr 1fr 3fr",
        gap: 6,
      }}
    >
      <WindBox id={0} />
      <Flex sx={{ flexDirection: "column", textAlign: "center", gap: 2 }}>
        <AerodromeSelect />
        <Button disabled>D/A</Button>
        <Flex sx={{ gap: 2 }}>
          {splitAtis && (
            <>
              <Flex sx={{ flexDirection: "column", flexGrow: 1 }}>
                ARR
                <InfoBox sx={{ fontSize: 6, flexGrow: 1 }}>
                  {atis?.atis_code ?? "-"}
                </InfoBox>
              </Flex>
              <Flex sx={{ flexDirection: "column", flexGrow: 1 }}>
                DEP
                <InfoBox sx={{ fontSize: 6, flexGrow: 1 }}>
                  {atis?.atis_code ?? "-"}
                </InfoBox>
              </Flex>
            </>
          )}
          {!splitAtis && (
            <InfoBox sx={{ fontSize: 6, flexGrow: 1 }}>
              {atis?.atis_code ?? "-"}
            </InfoBox>
          )}
        </Flex>
        <InfoBox>{metar && xmc(metar)}</InfoBox>
      </Flex>
      <WindBox id={1} />
    </Grid>
  )
}
