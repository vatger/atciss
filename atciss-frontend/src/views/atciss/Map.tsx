/** @jsxImportSource theme-ui */

import { useAppSelector } from "app/hooks"
import { SidebarLayout } from "components/SidebarLayout"
import { AerodromeLayer } from "components/atciss/map/AerodromeLayer"
import { AirwayLayer } from "components/atciss/map/AirwayLayer"
import { AreaLayer } from "components/atciss/map/AreaLayer"
import { BackgroundTiles } from "components/atciss/map/BackgroundTiles"
import { MapControls } from "components/atciss/map/MapControls"
import { NavaidLayer } from "components/atciss/map/NavaidLayer"
import { SectorLayer } from "components/atciss/map/SectorLayer"
import { SigmetLayer } from "components/atciss/map/SigmetLayer"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useRef } from "react"
import { MapContainer } from "react-leaflet"
import { selectMapCentre } from "services/configSlice"
import {
  selectAirwayOnMap,
  selectAreasOnMap,
  selectSectorsOnMap,
  selectSigmetOnMap,
} from "services/mapSlice"
import { Flex, ThemeUIStyleObject } from "theme-ui"

export const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const sectorsOnMap = useAppSelector(selectSectorsOnMap)
  const areasOnMap = useAppSelector(selectAreasOnMap)
  const airwaysOnMap = useAppSelector(selectAirwayOnMap)
  const sigmetOnMap = useAppSelector(selectSigmetOnMap)
  const centre = useAppSelector(selectMapCentre)
  const map = useRef<L.Map>(null)

  return (
    <SidebarLayout sx={sx}>
      <MapContainer
        center={centre}
        zoom={7}
        scrollWheelZoom={true}
        sx={{ height: "100%" }}
        ref={map}
      >
        <BackgroundTiles />
        {sectorsOnMap && <SectorLayer />}
        {areasOnMap && <AreaLayer />}
        {sigmetOnMap && <SigmetLayer />}
        <NavaidLayer />
        {airwaysOnMap && <AirwayLayer />}
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
