import { useAppSelector } from "app/hooks"
import { TileLayer, WMSTileLayer } from "react-leaflet"
import {
  selectDFSOnMap,
  selectDWDOnMap,
  selectLightning,
  selectOpenFlightmapsOnMap,
  selectSatelliteOnMap,
} from "services/mapSlice"
import { useColorMode } from "theme-ui"

export const BackgroundTiles = () => {
  const ofm = useAppSelector(selectOpenFlightmapsOnMap)
  const dfs = useAppSelector(selectDFSOnMap)
  const dwd = useAppSelector(selectDWDOnMap)
  const lightning = useAppSelector(selectLightning)
  const satellite = useAppSelector(selectSatelliteOnMap)
  const [colorMode] = useColorMode()

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={`https://{s}.basemaps.cartocdn.com/${
          colorMode === "default" ? "light" : "dark"
        }_nolabels/{z}/{x}/{y}.png`}
      />
      {satellite && (
        <TileLayer
          attribution="Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
          url="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      )}
      {lightning && (
        <TileLayer
          attribution="Lightning data © Lightningmaps.org and Blitzortung.org contributors CC-BY-SA 4.0"
          url="https://tiles.lightningmaps.org/?x={x}&y={y}&z={z}&s=256"
        />
      )}
      {ofm && (
        <>
          <TileLayer
            attribution='&copy; <a href="https://www.openflightmaps.org">open flightmaps</a> contributors'
            url="https://nwy-tiles-api.prod.newaydata.com/tiles/{z}/{x}/{y}.jpg?path=latest/base/latest"
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openflightmaps.org">open flightmaps</a> contributors'
            url="https://nwy-tiles-api.prod.newaydata.com/tiles/{z}/{x}/{y}.png?path=latest/aero/latest"
          />
        </>
      )}
      {dfs && (
        <TileLayer
          attribution='&copy; <a href="https://ais.dfs.de/pilotservice/service/aup/aup_edit_map.jsp">DFS, ICAO</a>'
          url="https://ais.dfs.de/static-maps/icao500/tiles/{z}/{x}/{y}.png"
        />
      )}
      {dwd && (
        <WMSTileLayer
          attribution="Deutscher Wetterdienst (DWD)"
          url="https://maps.dwd.de/geoserver/wms"
          params={{
            layers: "dwd:Niederschlagsradar",
            transparent: true,
            format: "image/png",
          }}
          opacity={1}
          pane="shadowPane"
        />
      )}
    </>
  )
}
