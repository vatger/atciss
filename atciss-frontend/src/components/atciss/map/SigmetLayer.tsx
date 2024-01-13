/** @jsxImportSource theme-ui */

import { useAppSelector } from "app/hooks"
import { z3 } from "app/utils"
import { VerticalBoundary } from "components/atciss/map/VerticalBoundary"
import { LatLng } from "leaflet"
import { DateTime } from "luxon"
import { useState } from "react"
import { LayerGroup, Polygon, Tooltip } from "react-leaflet"
import { selectActiveFir, selectNeighbourFirs } from "services/configSlice"
import {
  Sigmet as SigmetType,
  selectSigmets,
  usePollSigmet,
} from "services/sigmetApi"
import { Box, Text } from "theme-ui"

const Sigmet = ({ sigmet }: { sigmet: SigmetType }) => {
  const [center, setCenter] = useState<LatLng | null>(null)

  const start = DateTime.fromISO(sigmet.validTimeFrom).toUTC()
  const end = DateTime.fromISO(sigmet.validTimeTo).toUTC()
  const active = DateTime.utc() >= start && DateTime.utc() <= end

  return (
    active && (
      <Polygon
        pane="markerPane"
        pathOptions={{
          color: "#ff0",
          weight: 5,
          opacity: 1,
          fillOpacity: 0.5,
        }}
        positions={sigmet.coords}
        eventHandlers={{
          add: (p) => setCenter(p.target.getCenter()),
        }}
      >
        <VerticalBoundary
          min={(sigmet.base ?? 0) / 100}
          max={(sigmet.top ?? 0) / 100}
          center={center}
          color="#ff0"
        />
        <Tooltip>
          <Box sx={{ fontSize: "1" }}>
            <Text variant="label">
              {sigmet.firId} {sigmet.qualifier} {sigmet.hazard}
            </Text>
          </Box>
          <Box sx={{ fontSize: "1" }}>
            FL{z3((sigmet.base ?? 0) / 100)}-FL
            {z3((sigmet.top ?? 66000) / 100)}
          </Box>
          <Box sx={{ fontSize: "1" }}>
            <Text variant="label">
              {start.toFormat("y-MM-dd HH:mm")}-{end.toFormat("y-MM-dd HH:mm")}
            </Text>
          </Box>
          <pre sx={{ fontSize: "1" }}>{sigmet.rawSigmet}</pre>
        </Tooltip>
      </Polygon>
    )
  )
}

export const SigmetLayer = () => {
  const fir = useAppSelector(selectActiveFir)
  const neighbourFirs = useAppSelector(selectNeighbourFirs)
  usePollSigmet([fir, ...neighbourFirs])
  const sigmets = useAppSelector(selectSigmets)

  return (
    <LayerGroup>
      {sigmets.map((sigmet) => (
        <Sigmet sigmet={sigmet} key={sigmet.isigmetId} />
      ))}
    </LayerGroup>
  )
}
