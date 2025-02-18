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

  const sector = loa[`${from_to}_sector`]
  const displaySector = sector.replace(/.*\//, "")
  const position = useAppSelector((state) => selectOwner(state, sector))
  const frequency =
    position && position.id !== selectedPosition
      ? ` (${position?.frequency})`
      : ""
  return position && position.id !== selectedPosition && position.id !== sector
    ? `${displaySector} by ${position?.name}${frequency}`
    : `${displaySector}${frequency}`
}

export const LoaRow = ({ loa }: { loa: LoaItem }) => {
  return (
    <tr>
      <td>
        {loa.route_before} <strong>{loa.cop ?? "LoR"}</strong> {loa.route_after}
      </td>
      <td>
        {loa.adep && loa.adep.length > 0 && (
          <>&#x02197; {loa.adep.join(", ")}</>
        )}
        {loa.ades && loa.ades.length > 0 && (
          <>&#x02198; {loa.ades.join(", ")}</>
        )}
      </td>
      <td>
        {loa.transfer_type === "D" && <>&darr;</>}
        {loa.transfer_type === "C" && <>&uarr;</>}

        {loa.sfl && <>{loa.qnh ? `${loa.sfl}00ft` : `FL${loa.sfl}`}-</>}
        <strong>
          {loa.level === null
            ? "indiv. coord."
            : loa.qnh
              ? `${loa.level}00ft`
              : `FL${loa.level}`}
        </strong>
        {loa.qnh && <>, QNH {loa.qnh}</>}
      </td>
      <td>
        {[
          loa.level_at &&
            (loa.level_at[0] > 0
              ? `${loa.level_at[0]}nm after `
              : loa.level_at[0] < 0
                ? `${Math.abs(loa.level_at[0])}nm prior `
                : "") + `${loa.level_at[1]} at level`,
          loa.releases && `released ${loa.releases}`,
          /* TODO: filter by detected ATIS runway*/
          loa.runway &&
            loa.runway.length > 0 &&
            `Runways ${loa.runway.join(", ")}`,
          /* TODO: filter by active areas*/
          loa.areas &&
            loa.areas.length > 0 &&
            `Active Areas ${loa.areas.join(", ")}`,
          loa.rfl && `RFL: FL${loa.rfl}`,
          loa.remarks,
        ]
          .filter((val) => val)
          .join("; ")}
      </td>
      <td>
        <PositionInformation loa={loa} from_to="from" />
      </td>
      <td>
        <PositionInformation loa={loa} from_to="to" />
      </td>
    </tr>
  )
}
