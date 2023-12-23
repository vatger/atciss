/** @jsxImportSource theme-ui */

import { Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { MapContainer } from "react-leaflet"
import { LatLngTuple } from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapControls } from "../components/map/MapControls"
import { BackgroundTiles } from "../components/map/BackgroundTiles"
import { SectorLayer } from "../components/map/SectorLayer"
import { AerodromeLayer } from "../components/map/AerodromeLayer"
import { AreaLayer } from "../components/map/AreaLayer"
import { LoaNavaidLayer } from "../components/map/LoaNavaidLayer"
import { selectAreasOnMap, selectLoaOnMap } from "../services/mapSlice"
import { selectSectorsOnMap } from "../services/mapSlice"
import { useAppSelector } from "../app/hooks"

const position = [49.2646, 11.4134] as LatLngTuple

const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const loaOnMap = useAppSelector(selectLoaOnMap)
  const sectorsOnMap = useAppSelector(selectSectorsOnMap)
  const areasOnMap = useAppSelector(selectAreasOnMap)

  return (
    <Grid
      sx={{
        ...sx,
        gap: 1,
        gridTemplateColumns: "4fr 1fr",
        width: "100%",
      }}
    >
      <MapContainer
        center={position}
        zoom={7}
        scrollWheelZoom={true}
        sx={{ height: "100%" }}
      >
        <BackgroundTiles />
        {sectorsOnMap && <SectorLayer />}
        {areasOnMap && <AreaLayer />}
        {loaOnMap && <LoaNavaidLayer />}
        <AerodromeLayer />
      </MapContainer>
      <Flex
        sx={{ flexDirection: "column", gap: 2, overflow: "hidden", padding: 2 }}
      >
        <MapControls />
      </Flex>
    </Grid>
  )
}

export { Map }
