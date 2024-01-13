import { FIR_TO_VATGLASSES } from "app/config"
import { useAppSelector } from "app/hooks"
import { selectOwner, selectSelectedPosition } from "services/activePositions"
import { LoaItem } from "types/loa"

const PositionInformation = ({
  loa,
  from_to,
}: {
  loa: LoaItem
  from_to: "from" | "to"
}) => {
  const selectedPosition = useAppSelector(selectSelectedPosition)

  if (!loa[`${from_to}_sector`]) {
    return loa[`${from_to}_fir`]
  }
  const fir = loa[`${from_to}_fir`]
  const sector = loa[`${from_to}_sector`]
  const position = useAppSelector((state) =>
    selectOwner(state, `${FIR_TO_VATGLASSES[fir]}/${sector}`),
  )
  const frequency =
    position && position.id !== selectedPosition
      ? ` (${position?.frequency})`
      : ""
  return position &&
    position.id !== selectedPosition &&
    position.id !== `${FIR_TO_VATGLASSES[fir]}/${sector}`
    ? `${sector} by ${position?.name}${frequency}`
    : `${sector}${frequency}`
}

export const LoaRow = ({
  loa,
  showCop = true,
}: {
  loa: LoaItem
  showCop?: boolean
}) => {
  return (
    <tr>
      {showCop && <td>{loa.cop}</td>}
      <td>
        {loa.adep_ades === "ADEP" && <>&#x02197;</>}
        {loa.adep_ades === "ADES" && <>&#x02198;</>} {loa.aerodrome}
      </td>
      <td>
        {loa.xc === "A" && <>&uarr;</>}
        {loa.xc === "B" && <>&darr;</>}
        {loa.feet ? `${loa.level}00ft` : `FL${loa.level}`}
      </td>
      <td>{loa.special_conditions}</td>
      <td>
        <PositionInformation loa={loa} from_to="from" />
      </td>
      <td>
        <PositionInformation loa={loa} from_to="to" />
      </td>
    </tr>
  )
}
