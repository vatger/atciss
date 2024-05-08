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
import { MapContainer, Pane } from "react-leaflet"
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
        {sectorsOnMap && (
          <Pane name="sectors" style={{ zIndex: 320 }}>
            <SectorLayer />
          </Pane>
        )}
        {areasOnMap && (
          <Pane name="areas" style={{ zIndex: 330 }}>
            <AreaLayer />
          </Pane>
        )}
        {sigmetOnMap && (
          <Pane name="sigmet" style={{ zIndex: 340 }}>
            <SigmetLayer />
          </Pane>
        )}
        {airwaysOnMap && (
          <Pane name="airways" style={{ zIndex: 350 }}>
            <AirwayLayer />
          </Pane>
        )}
        <Pane name="navaids" style={{ zIndex: 360 }}>
          <NavaidLayer />
        </Pane>
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
