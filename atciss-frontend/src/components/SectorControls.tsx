import { Box, Button, Flex } from "theme-ui"
import {
  disableAllPositions,
  enableAllPositions,
  selectPositionGroups,
  selectSyncedToOnline,
  setSyncedToOnline,
} from "../services/activePositionSlice"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { usePollControllers } from "../services/controllerApi"
import { SectorGroup } from "./sectorControls/SectorGroup"
import { sectorApi } from "../services/sectorApi"
import { SelectedPosition } from "./sectorControls/SelectedPosition"

export const SectorControls = () => {
  const dispatch = useAppDispatch()

  const { data: _s } = sectorApi.useGetQuery()
  const { data: _c } = usePollControllers()

  const syncedToOnline = useAppSelector(selectSyncedToOnline)
  const positionGroups = useAppSelector(selectPositionGroups)

  return (
    <>
      <Box>
        <label>
          <input
            type="checkbox"
            checked={syncedToOnline}
            onChange={(e) => dispatch(setSyncedToOnline(e.target.checked))}
          />
          Sync to Online Controllers
        </label>
      </Box>
      <SelectedPosition />
      <Flex sx={{ flex: "none", justifyContent: "space-between" }}>
        <Button
          onClick={() => dispatch(enableAllPositions())}
          disabled={syncedToOnline}
        >
          Select All
        </Button>
        <Button
          onClick={() => dispatch(disableAllPositions())}
          disabled={syncedToOnline}
        >
          Deselect All
        </Button>
      </Flex>
      <Box sx={{ overflow: "auto", flex: "auto" }}>
        {positionGroups.map((group) => (
          <SectorGroup key={group} group={group} />
        ))}
      </Box>
    </>
  )
}
