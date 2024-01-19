import { useAppSelector } from "app/hooks"
import { Clock } from "components/atciss/Clock"
import { InfoBox } from "components/idvs/InfoBox"
import { selectDfsAd } from "services/aerodrome"
import { api } from "services/api"
import { selectActiveAerodrome } from "services/idvsSlice"
import {
  hpaToInhg,
  selectMetar,
  usePollMetarByIcaoCodes,
} from "services/metarApi"
import { Box, Flex, Grid } from "theme-ui"

export const BaroClock = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  const metar = useAppSelector((store) => selectMetar(store, aerodrome))
  const ad = useAppSelector((store) => selectDfsAd(store, aerodrome))
  const elevation = ad?.elevation
  const qfe =
    elevation !== null
      ? metar?.qnh - (12.017 * (elevation / 3.28084)) / 100
      : null

  return (
    <Flex sx={{ justifyContent: "space-between" }}>
      <Grid sx={{ gap: 3, gridAutoFlow: "column", alignItems: "baseline" }}>
        <Box>QNH</Box>
        <Flex>
          <InfoBox sx={{ fontSize: 6 }}>{metar?.qnh.toFixed(0)}</InfoBox>
          <InfoBox>{hpaToInhg(metar?.qnh).toFixed(2)}</InfoBox>
        </Flex>
        {qfe && (
          <>
            <Box>QFE</Box>
            <Flex>
              <InfoBox>{qfe.toFixed(0)}</InfoBox>
              <InfoBox>{hpaToInhg(qfe).toFixed(2)}</InfoBox>
            </Flex>
          </>
        )}
      </Grid>
      <Flex sx={{ gap: 3, alignItems: "baseline" }}>
        UTC <Clock />
      </Flex>
    </Flex>
  )
}
