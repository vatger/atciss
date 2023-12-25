import { Box, Text } from "theme-ui"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  selectActivePositions,
  selectPositionSyncedToOnline,
  selectSelectedPosition,
  setSelectedPosition,
} from "../../services/activePositionSlice"
import { selectPosition } from "../../services/sectorApi"
import { selectMe } from "../../services/controllerApi"

const PositionOption = ({ id }: { id: string }) => {
  const position = useAppSelector((store) => selectPosition(store, id))
  return (
    <option value={id}>
      {position?.pre?.[0]} {position?.name} ({position?.frequency})
    </option>
  )
}

export const SelectedPosition = () => {
  const dispatch = useAppDispatch()
  const activePositions = useAppSelector(selectActivePositions)
  const selectedPosition = useAppSelector(selectSelectedPosition)
  const positionSyncedToOnline = useAppSelector(selectPositionSyncedToOnline)
  const me = useAppSelector(selectMe)

  return (
    <label>
      <Text variant="label">Selected Position </Text>
      <Box>
        {positionSyncedToOnline && me ? (
          <>
            {selectedPosition?.replace(/.*\//, "")} ({me.callsign}, {me.name},{" "}
            {me.cid})
          </>
        ) : (
          <select
            value={selectedPosition ?? undefined}
            onChange={(e) => dispatch(setSelectedPosition(e.target.value))}
          >
            {Object.entries(activePositions)
              .filter(([, p]) => p)
              .map(([id]) => (
                <PositionOption key={id} id={id} />
              ))}
          </select>
        )}
      </Box>
    </label>
  )
}
