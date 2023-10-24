import { Box, Text } from "theme-ui"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { usePollControllers } from "../../services/controllerApi"
import {
  selectAreasOnMap,
  selectDFSOnMap,
  selectDWDOnMap,
  selectLoaOnMap,
  selectOpenFlightmapsOnMap,
  selectSatelliteOnMap,
  selectSectorsOnMap,
  setAreas,
  setDFS,
  setDWD,
  setLoa,
  setOpenFlightmaps,
  setSatellite,
  setSectors,
} from "../../services/mapSlice"
import { SectorControls } from "../SectorControls"
import { LevelChoice } from "./LevelChoice"

export const MapControls = () => {
  const dispatch = useAppDispatch()

  usePollControllers()

  const ofm = useAppSelector(selectOpenFlightmapsOnMap)
  const dfs = useAppSelector(selectDFSOnMap)
  const dwd = useAppSelector(selectDWDOnMap)
  const satellite = useAppSelector(selectSatelliteOnMap)
  const sectors = useAppSelector(selectSectorsOnMap)
  const areas = useAppSelector(selectAreasOnMap)
  const loa = useAppSelector(selectLoaOnMap)

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
            checked={satellite}
            onChange={(e) => dispatch(setSatellite(e.target.checked))}
          />
          Satellite
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
            checked={areas}
            onChange={(e) => dispatch(setAreas(e.target.checked))}
          />
          Areas
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
      <Box>
        <Text as="label" variant="label">
          <input
            type="checkbox"
            checked={loa}
            onChange={(e) => dispatch(setLoa(e.target.checked))}
          />
          LOA
        </Text>
      </Box>
      {(areas || sectors || loa) && <LevelChoice />}
      {sectors && <SectorControls />}
    </>
  )
}
