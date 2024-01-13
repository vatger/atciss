import { useAppDispatch, useAppSelector } from "app/hooks"
import { setPosition } from "services/activePositionSlice"
import {
  selectIsPositionActive,
  selectSectorsSyncedToOnline,
} from "services/activePositions"
import { selectPosition } from "services/sectorApi"
import { Flex } from "theme-ui"

export const Sector = ({ id }: { id: string }) => {
  const dispatch = useAppDispatch()
  const syncedToOnline = useAppSelector(selectSectorsSyncedToOnline)
  const isActive = useAppSelector((store) => selectIsPositionActive(store, id))
  const position = useAppSelector((store) => selectPosition(store, id))

  return syncedToOnline ? (
    isActive && (
      <Flex sx={{ flexBasis: "50%" }}>
        {`${position?.name} (${position?.frequency})`}
      </Flex>
    )
  ) : (
    <Flex sx={{ flexBasis: "33%" }}>
      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) =>
            dispatch(setPosition({ id, active: e.target.checked }))
          }
        />
        {position?.name}
      </label>
    </Flex>
  )
}
