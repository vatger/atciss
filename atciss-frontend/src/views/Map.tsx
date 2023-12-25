/** @jsxImportSource theme-ui */

import { Flex, ThemeUIStyleObject } from "theme-ui"
import { MapContainer } from "react-leaflet"
import L, { LatLngTuple } from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapControls } from "../components/map/MapControls"
import { BackgroundTiles } from "../components/map/BackgroundTiles"
import { SectorLayer } from "../components/map/SectorLayer"
import { AerodromeLayer } from "../components/map/AerodromeLayer"
import { AreaLayer } from "../components/map/AreaLayer"
import { NavaidLayer } from "../components/map/NavaidLayer"
import { selectAreasOnMap } from "../services/mapSlice"
import { selectSectorsOnMap } from "../services/mapSlice"
import { useAppSelector } from "../app/hooks"
import { useRef } from "react"
import { SidebarLayout } from "../components/SidebarLayout"

const position = [49.2646, 11.4134] as LatLngTuple

export const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const sectorsOnMap = useAppSelector(selectSectorsOnMap)
  const areasOnMap = useAppSelector(selectAreasOnMap)
  const map = useRef<L.Map>(null)

  return (
    <SidebarLayout sx={sx}>
      <MapContainer
        center={position}
        zoom={7}
        scrollWheelZoom={true}
        sx={{ height: "100%" }}
        ref={map}
      >
        <BackgroundTiles />
        {sectorsOnMap && <SectorLayer />}
        {areasOnMap && <AreaLayer />}
        <NavaidLayer />
        <AerodromeLayer />
      </MapContainer>
      <Flex
        sx={{ flexDirection: "column", gap: 2, overflow: "hidden", padding: 2 }}
      >
        <MapControls map={map} />
      </Flex>
    </SidebarLayout>
  )
}
