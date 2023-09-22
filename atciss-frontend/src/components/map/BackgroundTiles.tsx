import { TileLayer, WMSTileLayer } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import {
  selectDFS,
  selectDWD,
  selectOpenFlightmaps,
} from "../../services/mapSlice"

export const BackgroundTiles = () => {
  const ofm = useAppSelector(selectOpenFlightmaps)
  const dfs = useAppSelector(selectDFS)
  const dwd = useAppSelector(selectDWD)

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
      />
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
            layers: "dwd:RX-Produkt",
            transparent: true,
            format: "image/png",
          }}
          opacity={0.5}
          pane="shadowPane"
        />
      )}
    </>
  )
}
