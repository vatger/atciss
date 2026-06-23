import { useAppSelector } from "app/hooks"
import { LoaTooltipTable } from "components/atciss/LoaTooltipTable"
import { NavaidMarker } from "components/atciss/map/NavaidMarker"
import {
  selectEntryLoasByNavaid,
  selectExitLoasByNavaid,
} from "services/loaApi"
import { selectLoaNavaid } from "services/navaidApi"

export const LoaNavaidMarker = ({ designator }: { designator: string }) => {
  const navaid = useAppSelector((store) => selectLoaNavaid(store, designator))
  const xloasByNavaid = useAppSelector((store) =>
    selectExitLoasByNavaid(store, designator),
  )
  const nloasByNavaid = useAppSelector((store) =>
    selectEntryLoasByNavaid(store, designator),
  )

  return (
    navaid && (
      <NavaidMarker navaid={navaid}>
        <LoaTooltipTable
          exitAgreements={xloasByNavaid}
          entryAgreements={nloasByNavaid}
        />
      </NavaidMarker>
    )
  )
}
