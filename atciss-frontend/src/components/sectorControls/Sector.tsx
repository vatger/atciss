import { Flex } from "theme-ui"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  selectIsPositionActive,
  selectSectorsSyncedToOnline,
  setPosition,
} from "../../services/activePositionSlice"
import { selectPosition } from "../../services/sectorApi"

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
