import { useAppSelector } from "app/hooks"
import { LoaTooltipTable } from "components/atciss/LoaTooltipTable"
import { Tooltip } from "components/atciss/map/Tooltip"
import { memo } from "react"
import { Polyline } from "react-leaflet"
import { selectOpenFlightmapsOnMap } from "services/mapSlice"
import { useColorMode } from "theme-ui"
import { LoaItem } from "types/loa"

const BorderAgreementLineComponent = ({
  segment,
  exitAgreements,
  entryAgreements,
}: {
  segment: [number, number][]
  exitAgreements: LoaItem[]
  entryAgreements: LoaItem[]
}) => {
  const [colorMode] = useColorMode()
  const ofm = useAppSelector(selectOpenFlightmapsOnMap)
  const isLightTheme = ofm || colorMode === "default"

  return (
    <Polyline
      positions={segment}
      pathOptions={{
        dashArray: "8 6",
        weight: 3,
        color: isLightTheme ? "#000" : "#fff",
      }}
    >
      <Tooltip>
        <LoaTooltipTable
          exitAgreements={exitAgreements}
          entryAgreements={entryAgreements}
        />
      </Tooltip>
    </Polyline>
  )
}

export const BorderAgreementLine = memo(BorderAgreementLineComponent)
