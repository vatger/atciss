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
        rwy1="08L"
        rwy2="26R"
        rvrs={["D", "C", "B", "A"]}
        sx={{ position: "absolute", left: "1%", top: "2rem", width: "98%" }}
      ></HorizontalRunwayStrip>
      <HorizontalRunwayStrip
        rwy1="08R"
        rwy2="26L"
        rvrs={["H", "G", "F", "E"]}
        sx={{ position: "absolute", left: "1%", bottom: "2rem", width: "98%" }}
      ></HorizontalRunwayStrip>
    </>
  )
}
