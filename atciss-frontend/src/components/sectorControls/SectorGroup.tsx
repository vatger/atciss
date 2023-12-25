/** @jsxImportSource theme-ui */

import { Flex, Text } from "theme-ui"
import { Sector } from "./Sector"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  selectIsGroupActive,
  selectPositionsByGroup,
  selectSectorsSyncedToOnline,
  setPositionGroup,
} from "../../services/activePositionSlice"

export const SectorGroup = ({ group }: { group: string }) => {
  const positions = useAppSelector((store) =>
    selectPositionsByGroup(store, group),
  )
  const isActive = useAppSelector((store) => selectIsGroupActive(store, group))
  const syncedToOnline = useAppSelector(selectSectorsSyncedToOnline)
  const dispatch = useAppDispatch()

  return (
    !!positions.length && (
      <Flex sx={{ flexWrap: "wrap", marginY: 2 }}>
        <label sx={{ flexBasis: "100%", marginBottom: 1 }}>
          {!syncedToOnline && (
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                dispatch(
                  setPositionGroup({ positions, active: e.target.checked }),
                )
              }
            />
          )}
          <Text variant="label">{group}</Text>
        </label>
        {positions.map((id) => (
          <Sector key={id} id={id} />
        ))}
      </Flex>
    )
  )
}
