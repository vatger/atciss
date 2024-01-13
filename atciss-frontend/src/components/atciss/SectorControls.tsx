import { useAppDispatch, useAppSelector } from "app/hooks"
import { SectorGroup } from "components/atciss/sectorControls/SectorGroup"
import { SelectedPosition } from "components/atciss/sectorControls/SelectedPosition"
import {
  disableAllPositions,
  enableAllPositions,
  setPositionSyncedToOnline,
  setSectorsSyncedToOnline,
} from "services/activePositionSlice"
import {
  selectPositionGroups,
  selectPositionSyncedToOnline,
  selectSectorsSyncedToOnline,
} from "services/activePositions"
import { api } from "services/api"
import { selectMe, usePollControllers } from "services/controllerApi"
import { Box, Button, Flex, Text } from "theme-ui"

export const SectorControls = () => {
  const dispatch = useAppDispatch()

  api.useSectorsQuery()
  usePollControllers()

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
