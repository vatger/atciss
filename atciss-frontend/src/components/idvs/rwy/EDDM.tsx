import { useAppSelector } from "app/hooks"
import { api } from "services/api"
import { selectActiveAerodrome } from "services/idvsSlice"
import { usePollMetarByIcaoCodes } from "services/metarApi"
import { HorizontalRunwayStrip } from "../Runways"

export const EDDM = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  return (
    <>
      <HorizontalRunwayStrip
        sx={{ position: "absolute", left: "1%", top: "2rem", width: "98%" }}
      ></HorizontalRunwayStrip>
    </>
  )
}
