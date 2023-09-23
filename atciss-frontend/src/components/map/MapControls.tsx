import { Box, Text } from "theme-ui"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { usePollControllers } from "../../services/controllerApi"
import {
  selectDFS,
  selectDWD,
  selectOpenFlightmaps,
  selectSectors,
  setDFS,
  setDWD,
  setOpenFlightmaps,
  setSectors,
} from "../../services/mapSlice"
import { SectorControls } from "../SectorControls"
import { LevelChoice } from "./LevelChoice"

export const MapControls = () => {
  const dispatch = useAppDispatch()

  usePollControllers()

  const ofm = useAppSelector(selectOpenFlightmaps)
  const dfs = useAppSelector(selectDFS)
  const dwd = useAppSelector(selectDWD)
  const sectors = useAppSelector(selectSectors)

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
            checked={dwd}
            onChange={(e) => dispatch(setDWD(e.target.checked))}
          />
          DWD Niederschlagsradar
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
          <LevelChoice />
          <SectorControls />
        </>
      )}
    </>
  )
}
