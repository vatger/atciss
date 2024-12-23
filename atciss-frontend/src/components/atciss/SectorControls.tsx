import { SPLIT_PRESETS } from "app/config"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { SectorGroup } from "components/atciss/sectorControls/SectorGroup"
import { SelectedPosition } from "components/atciss/sectorControls/SelectedPosition"
import { useSearchParams } from "react-router"
import {
  disableAllPositions,
  enableAllPositions,
  enableOnlyPositions,
  setControlType,
  setPositionSyncedToOnline,
  setSectorsSyncedToOnline,
} from "services/activePositionSlice"
import {
  selectControlType,
  selectPositionGroups,
  selectPositionSyncedToOnline,
  selectSectorsSyncedToOnline,
} from "services/activePositions"
import { api } from "services/api"
import { selectMe, usePollControllers } from "services/controllerApi"
import { setLevel } from "services/mapSlice"
import { Box, Button, Flex, Grid, Text } from "theme-ui"

export const SectorControls = () => {
  const dispatch = useAppDispatch()

  api.useSectorsQuery()
  usePollControllers()

  const positionSyncedToOnline = useAppSelector(selectPositionSyncedToOnline)
  const sectorsSyncedToOnline = useAppSelector(selectSectorsSyncedToOnline)
  const positionGroups = useAppSelector(selectPositionGroups)
  const me = useAppSelector(selectMe)
  const controlType = useAppSelector(selectControlType)
  const [, setSearchParams] = useSearchParams()

  return (
    <>
      <Flex sx={{ justifyContent: "space-between" }}>
        <Text variant="label">Sync to</Text>
        <label>
          <input
            type="checkbox"
            checked={sectorsSyncedToOnline}
            onChange={(e) =>
              dispatch(setSectorsSyncedToOnline(e.target.checked))
            }
          />
          Online Sectors
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
          My Active Position
        </label>
      </Flex>
      <SelectedPosition />
      {!sectorsSyncedToOnline && (
        <Flex sx={{ flex: "none", justifyContent: "space-between" }}>
          <Text variant="label">Selection</Text>
          <label>
            <input
              name="controlType"
              type="radio"
              value="manual"
              checked={controlType === "manual"}
              onChange={() => dispatch(setControlType("manual"))}
            />{" "}
            Manual
          </label>
          <label>
            <input
              name="controlType"
              type="radio"
              value="presets"
              checked={controlType === "presets"}
              onChange={() => dispatch(setControlType("presets"))}
            />{" "}
            Presets
          </label>
        </Flex>
      )}
      {sectorsSyncedToOnline || controlType === "manual" ? (
        <>
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
      ) : (
        <Box sx={{ overflow: "auto", flex: "auto" }}>
          {Object.entries(SPLIT_PRESETS).map(([group, presets]) => (
            <Grid
              key={group}
              sx={{ gap: 1, gridTemplateColumns: "1fr 1fr 1fr" }}
            >
              <Text variant="label" sx={{ gridColumnEnd: "span 3" }}>
                {group}
              </Text>
              {Object.entries(presets).map(([name, preset]) => (
                <Button
                  sx={{ fontSize: 1 }}
                  key={name}
                  onClick={() => {
                    dispatch(enableOnlyPositions(preset.positions))
                    if (preset.level !== undefined) {
                      dispatch(setLevel(preset.level))
                    }
                    setSearchParams(
                      new URLSearchParams([
                        ...(preset.level !== undefined
                          ? [["level", preset.level.toString()]]
                          : []),
                        ...preset.positions.map((id) => ["pos", id]),
                      ]),
                    )
                  }}
                >
                  {name}
                </Button>
              ))}
            </Grid>
          ))}
        </Box>
      )}
    </>
  )
}
