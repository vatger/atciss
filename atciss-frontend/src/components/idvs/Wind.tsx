import { useAppDispatch, useAppSelector } from "app/hooks"
import { z3 } from "app/utils"
import { InfoBox } from "components/idvs/InfoBox"
import { Select } from "components/idvs/Select"
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
import { Box, Button, Flex, Grid } from "theme-ui"

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
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          borderWidth: "3px",
          borderStyle: "groove",
          padding: 1,
        }}
      >
        <Box sx={{ fontSize: 5 }}>{runway?.designator}</Box>
        <Grid
          sx={{
            gridTemplateColumns: "auto auto",
            gap: 0,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Box>Direction</Box>
          <Box>Speed</Box>
          <InfoBox sx={{ fontSize: 6 }}>
            {metar.wind_dir ? z3(metar.wind_dir) : "VRB"}
          </InfoBox>
          <InfoBox sx={{ fontSize: 6 }}>{metar.wind_speed}</InfoBox>
        </Grid>
        <Flex sx={{ gap: 2, alignItems: "baseline", alignSelf: "end" }}>
          <Box>{runway?.designator}:</Box>
          <Box>Head</Box>
          <InfoBox>{head?.toFixed(0) ?? "-"}</InfoBox>
          <Box>Cross</Box>
          <InfoBox>{cross?.toFixed(0) ?? "-"}</InfoBox>
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
    <Select
      onChange={(e) => dispatch(setActiveAerodrome(e.target.value))}
      value={aerodrome}
    >
      {metarIcaos.map((ad) => (
        <option key={ad}>{ad}</option>
      ))}
    </Select>
  )
}

export const Wind = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  usePollAtisByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  const metar = useAppSelector((store) => selectMetar(store, aerodrome))
  const atis = useAppSelector((store) => selectAtis(store, aerodrome))

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
        <InfoBox sx={{ fontSize: 6 }}>{atis?.atis_code ?? "-"}</InfoBox>
        <InfoBox>{metar && xmc(metar)}</InfoBox>
      </Flex>
      <WindBox id={1} />
    </Grid>
  )
}
