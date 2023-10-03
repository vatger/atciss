import { Box, Button, Flex, Text } from "theme-ui"
import { sectorApi } from "../services/airspaceApi"
import {
  disableAllPositions,
  enableAllPositions,
  selectActivePositions,
  selectSelectedPosition,
  selectSyncedToOnline,
  setPosition,
  setSelectedPosition,
  setSyncedToOnline,
} from "../services/activePositionSlice"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { usePollControllers } from "../services/controllerApi"

export const SectorControls = () => {
  const dispatch = useAppDispatch()

  const { data } = sectorApi.useGetByRegionQuery()
  usePollControllers()

  const activePositions = useAppSelector(selectActivePositions)
  const syncedToOnline = useAppSelector(selectSyncedToOnline)
  const selectedPosition = useAppSelector(selectSelectedPosition)

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
      <Box>
        <label>
          <Text variant="label">Selected Position </Text>
          <select
            value={selectedPosition ?? undefined}
            onChange={(e) => dispatch(setSelectedPosition(e.target.value))}
          >
            {Object.entries(activePositions)
              .filter(([_, p]) => p[syncedToOnline ? "online" : "manual"])
              .map(([id, p]) => (
                <option key={id} value={id}>
                  {id} ({p.position.frequency})
                </option>
              ))}
          </select>
        </label>
      </Box>
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
        {data &&
          Object.entries(
            Object.entries(data.positions)
              .filter(([id]) => !["MMC", "WWC", "GGC"].includes(id))
              .reduce((acc, [id, p]) => {
                return {
                  ...acc,
                  [p.pre[0]]: [...(acc[p.pre[0]] ?? []), id],
                }
              }, {} as { [index: string]: string[] }),
          ).map(([group, positions]) => (
            <Flex sx={{ flexWrap: "wrap", marginY: 2 }} key={group}>
              <Text sx={{ flexBasis: "100%", marginBottom: 1 }} variant="label">
                {group}
              </Text>
              {positions.map((id) => (
                <Flex key={id} sx={{ flexBasis: "33%" }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        (syncedToOnline
                          ? activePositions[id]?.online
                          : activePositions[id]?.manual) ?? false
                      }
                      disabled={syncedToOnline}
                      onChange={(e) =>
                        dispatch(setPosition({ id, active: e.target.checked }))
                      }
                    />
                    {id}
                  </label>
                </Flex>
              ))}
            </Flex>
          ))}
      </Box>
    </>
  )
}
