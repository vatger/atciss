import { Box, Button, Flex, Text } from "theme-ui"
import { sectorApi } from "../../services/airspaceApi"
import {
  disableAllPositions,
  enableAllPositions,
  selectActivePositions,
  setPosition,
} from "../../services/activePositionSlice"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

export const SectorChoice = () => {
  const dispatch = useAppDispatch()

  const { data } = sectorApi.useGetByRegionQuery("germany")
  const activePositions = useAppSelector(selectActivePositions)

  return (
    <>
      <Flex sx={{ flex: "none", justifyContent: "space-between" }}>
        <Button onClick={() => dispatch(enableAllPositions())}>
          Select All
        </Button>
        <Button onClick={() => dispatch(disableAllPositions())}>
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
                      checked={activePositions[id] ?? false}
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
