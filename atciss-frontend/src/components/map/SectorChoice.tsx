import { Box, Button, Flex, Grid, Input, Label, Slider, Text } from "theme-ui"
import { sectorApi } from "../../services/airspaceApi"
import {
  disableAllPositions,
  enableAllPositions,
  selectActivePositions,
  selectSyncedToOnline,
  setPosition,
  setSyncedToOnline,
} from "../../services/activePositionSlice"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { usePollControllers } from "../../services/controllerApi"
import { useId } from "react"
import {
  selectDFS,
  selectLevel,
  selectOpenFlightmaps,
  selectSectors,
  setDFS,
  setLevel,
  setOpenFlightmaps,
  setSectors,
} from "../../services/mapSlice"

export const SectorChoice = () => {
  const dispatch = useAppDispatch()

  const { data } = sectorApi.useGetByRegionQuery("germany")
  usePollControllers()

  const level = useAppSelector(selectLevel)
  const ofm = useAppSelector(selectOpenFlightmaps)
  const dfs = useAppSelector(selectDFS)
  const sectors = useAppSelector(selectSectors)

  const activePositions = useAppSelector(selectActivePositions)
  const syncedToOnline = useAppSelector(selectSyncedToOnline)

  const levelSliderId = useId()

  return (
    <>
      <Box>
        <Text as="label" variant="label">
          <input
            type="checkbox"
            checked={ofm}
            onChange={(e) => dispatch(setOpenFlightmaps(e.target.checked))}
          />
          open flightmaps
        </Text>
      </Box>
      <Box>
        <Text as="label" variant="label">
          <input
            type="checkbox"
            checked={dfs}
            onChange={(e) => dispatch(setDFS(e.target.checked))}
          />
          DFS ICAO map
        </Text>
      </Box>
      <Box>
        <Text as="label" variant="label">
          <input
            type="checkbox"
            checked={sectors}
            onChange={(e) => dispatch(setSectors(e.target.checked))}
          />
          Sectors
        </Text>
      </Box>
      {sectors && (
        <>
          <Grid
            sx={{
              flex: "none",
              gap: 3,
              gridAutoFlow: "column",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Label sx={{ fontWeight: "bold" }} htmlFor={levelSliderId}>
              Level
            </Label>
            <Slider
              id={levelSliderId}
              sx={{ display: "block" }}
              min="0"
              max="660"
              step="10"
              value={level}
              onChange={(e) => dispatch(setLevel(parseInt(e.target.value)))}
            />
            <Input
              type="number"
              min="0"
              max="660"
              step="10"
              value={level}
              onChange={(e) => dispatch(setLevel(parseInt(e.target.value)))}
            />
          </Grid>
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
                  <Text
                    sx={{ flexBasis: "100%", marginBottom: 1 }}
                    variant="label"
                  >
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
                            dispatch(
                              setPosition({ id, active: e.target.checked }),
                            )
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
      )}
    </>
  )
}
