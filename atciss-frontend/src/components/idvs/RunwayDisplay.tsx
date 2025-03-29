import { useAppSelector } from "app/hooks"
import { api } from "services/api"
import { selectActiveAerodrome } from "services/idvsSlice"
import { usePollMetarByIcaoCodes } from "services/metarApi"
import { Box, Text } from "theme-ui"
import { EDDF } from "./rwy/EDDF"
import { EDDM } from "./rwy/EDDM"

const getRunwayDisplay = (aerodrome: string) => {
  switch (aerodrome) {
    case "EDDF":
      return <EDDF />
    case "EDDM":
      return <EDDM />
    default:
      return <Text>not yet implemented :c</Text>
  }
}

export const RunwayDisplay = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  return (
    <Box
      sx={{
        flexGrow: 9,
        borderWidth: "3px",
        borderStyle: "groove",
        borderColor: "brightshadow",
        position: "relative",
      }}
    >
      {getRunwayDisplay(aerodrome)}
    </Box>
  )
}
