import { useAppSelector } from "../app/hooks"
import {
  Positions,
  selectActivePositions,
  selectSectorToOwner,
  selectSelectedPosition,
} from "../services/activePositionSlice"
import { LoaItem } from "../services/loaApi"

const positionInformation = (
  sectorToOwner: ReturnType<typeof selectSectorToOwner>,
  selectedPosition: string | null,
  positions: Positions,
  loa: LoaItem,
  from_to: "from" | "to",
): string => {
  if (!loa[`${from_to}_sector`]) {
    return loa[`${from_to}_fir`]
  }
  const sector = loa[`${from_to}_sector`]
  const controllingPosition = sectorToOwner[sector]
  const frequency =
    controllingPosition && controllingPosition !== selectedPosition
      ? ` (${positions[controllingPosition].position.frequency})`
      : ""
  return controllingPosition &&
    controllingPosition !== selectedPosition &&
    controllingPosition !== sector
    ? `${sector} by ${controllingPosition}${frequency}`
    : `${sector}${frequency}`
}

export const LoaRow = ({ loa }: { loa: LoaItem }) => {
  const sectorToOwner = useAppSelector(selectSectorToOwner)
  const selectedPosition = useAppSelector(selectSelectedPosition)
  const positions = useAppSelector(selectActivePositions)

  return (
    <tr>
      <td>{loa.cop}</td>
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
        {positionInformation(
          sectorToOwner,
          selectedPosition,
          positions,
          loa,
          "from",
        )}
      </td>
      <td>
        {positionInformation(
          sectorToOwner,
          selectedPosition,
          positions,
          loa,
          "to",
        )}
      </td>
    </tr>
  )
}
