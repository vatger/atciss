import { useAppDispatch, useAppSelector } from "app/hooks"
import { Map } from "leaflet"
import { RefObject } from "react"
import { usePollControllers } from "services/controllerApi"
import {
  selectAirwayLowerUpper,
  selectAirwayOnMap,
  selectAreasOnMap,
  selectDFSOnMap,
  selectDWDOnMap,
  selectLightning,
  selectLoaOnMap,
  selectOpenFlightmapsOnMap,
  selectSatelliteOnMap,
  selectSectorsOnMap,
  selectSigmetOnMap,
  setAirwayLowerUpper,
  setAirwayOnMap,
  setAreas,
  setDFS,
  setDWD,
  setLightning,
  setLoa,
  setOpenFlightmaps,
  setSatellite,
  setSectors,
  setSigmet,
} from "services/mapSlice"
import { Button, Flex } from "theme-ui"
import { SectorControls } from "../SectorControls"
import { LevelChoice } from "./LevelChoice"
import { Search } from "./search/Search"

export const MapControls = ({ map }: { map: RefObject<Map> }) => {
  const dispatch = useAppDispatch()

  usePollControllers()

  const ofm = useAppSelector(selectOpenFlightmapsOnMap)
  const dfs = useAppSelector(selectDFSOnMap)
  const dwd = useAppSelector(selectDWDOnMap)
  const satellite = useAppSelector(selectSatelliteOnMap)
  const lightning = useAppSelector(selectLightning)
  const sectors = useAppSelector(selectSectorsOnMap)
  const areas = useAppSelector(selectAreasOnMap)
  const loa = useAppSelector(selectLoaOnMap)
  const airways = useAppSelector(selectAirwayOnMap)
  const airwayLowerUpper = useAppSelector(selectAirwayLowerUpper)
  const sigmet = useAppSelector(selectSigmetOnMap)

  return (
    <Search map={map}>
      <Flex
        sx={{ justifyContent: "space-evenly", gap: 2, alignItems: "center" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
        <Button
          variant={ofm ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setOpenFlightmaps(!ofm))}
        >
          OFM
        </Button>
        <Button
          variant={dfs ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setDFS(!dfs))}
        >
          ICAO
        </Button>
        <Button
          variant={satellite ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setSatellite(!satellite))}
        >
          SAT
        </Button>
      </Flex>
      <Flex
        sx={{ justifyContent: "space-evenly", gap: 2, alignItems: "center" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
          <polyline points="13 11 9 17 15 17 11 23"></polyline>
        </svg>
        <Button
          variant={dwd ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setDWD(!dwd))}
        >
          DWD Precip
        </Button>
        <Button
          variant={lightning ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setLightning(!lightning))}
        >
          Lightning
        </Button>
        <Button
          variant={sigmet ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setSigmet(!sigmet))}
        >
          SIGMET
        </Button>
      </Flex>
      <Flex
        sx={{ justifyContent: "space-evenly", gap: 2, alignItems: "center" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <Button
          variant={sectors ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setSectors(!sectors))}
        >
          Sectors
        </Button>
        <Button
          variant={loa ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setLoa(!loa))}
        >
          LOA
        </Button>
        <Button
          variant={areas ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setAreas(!areas))}
        >
          Areas
        </Button>
      </Flex>
      <Flex
        sx={{ justifyContent: "space-evenly", gap: 2, alignItems: "center" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="1.05" y1="12" x2="7" y2="12"></line>
          <line x1="17.01" y1="12" x2="22.96" y2="12"></line>
        </svg>
        <Button
          variant={airways ? "selectedSecondaryNav" : "secondaryNav"}
          sx={{ flex: 1 }}
          onClick={() => dispatch(setAirwayOnMap(!airways))}
        >
          Airways
        </Button>
        <Button
          variant={
            airwayLowerUpper === "LOWER"
              ? "selectedSecondaryNav"
              : "secondaryNav"
          }
          sx={{
            flex: 1,
            visibility: airways ? "visible" : "hidden",
          }}
          onClick={() => dispatch(setAirwayLowerUpper("LOWER"))}
        >
          lower
        </Button>
        <Button
          variant={
            airwayLowerUpper === "UPPER"
              ? "selectedSecondaryNav"
              : "secondaryNav"
          }
          sx={{ flex: 1, visibility: airways ? "visible" : "hidden" }}
          onClick={() => dispatch(setAirwayLowerUpper("UPPER"))}
        >
          upper
        </Button>
      </Flex>

      {(areas || sectors || loa) && <LevelChoice />}
      {sectors && <SectorControls />}
    </Search>
  )
}
