import { Box, Button, Flex, Text } from "theme-ui"
import {
  disableAllPositions,
  enableAllPositions,
  selectPositionGroups,
  selectPositionSyncedToOnline,
  selectSectorsSyncedToOnline,
  setPositionSyncedToOnline,
  setSectorsSyncedToOnline,
} from "../services/activePositionSlice"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { selectMe, usePollControllers } from "../services/controllerApi"
import { SectorGroup } from "./sectorControls/SectorGroup"
import { sectorApi } from "../services/sectorApi"
import { SelectedPosition } from "./sectorControls/SelectedPosition"

export const SectorControls = () => {
  const dispatch = useAppDispatch()

  const { data: _s } = sectorApi.useGetQuery()
  const { data: _c } = usePollControllers()

  const positionSyncedToOnline = useAppSelector(selectPositionSyncedToOnline)
  const sectorsSyncedToOnline = useAppSelector(selectSectorsSyncedToOnline)
  const positionGroups = useAppSelector(selectPositionGroups)
  const me = useAppSelector(selectMe)

  return (
    <>
      <Text variant="label">Sync to Online</Text>
      <Flex sx={{ justifyContent: "space-between" }}>
        <label>
          <input
            type="checkbox"
            checked={sectorsSyncedToOnline}
            onChange={(e) =>
              dispatch(setSectorsSyncedToOnline(e.target.checked))
            }
          />
          Sectors
        </label>
        <label>
          <input
            type="checkbox"
            checked={positionSyncedToOnline}
            disabled={!me}
            onChange={(e) =>
              dispatch(setPositionSyncedToOnline(e.target.checked))
            }
          />
          Active Position
        </label>
      </Flex>
      <SelectedPosition />
      {!sectorsSyncedToOnline && (
        <Flex sx={{ flex: "none", justifyContent: "space-between" }}>
          <Button onClick={() => dispatch(enableAllPositions())}>
            Select All
          </Button>
          <Button onClick={() => dispatch(disableAllPositions())}>
            Deselect All
          </Button>
        </Flex>
      )}
      <Box sx={{ overflow: "auto", flex: "auto" }}>
        {positionGroups.map((group) => (
          <SectorGroup key={group} group={group} />
        ))}
      </Box>
    </>
  )
}
