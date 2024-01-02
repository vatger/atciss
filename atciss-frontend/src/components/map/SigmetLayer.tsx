/** @jsxImportSource theme-ui */

import { LayerGroup, Polygon, Tooltip } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import { Box, Text } from "theme-ui"
import { z3 } from "../../app/utils"
import { DateTime } from "luxon"
import { useState } from "react"
import { LatLng } from "leaflet"
import { VerticalBoundary } from "./VerticalBoundary"
import {
  selectActiveFir,
  selectNeighbourFirs,
} from "../../services/configSlice"
import {
  selectSigmets,
  usePollSigmet,
  Sigmet as SigmetType,
} from "../../services/sigmetApi"

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
  const { data: _s } = usePollSigmet([fir, ...neighbourFirs])
  const sigmets = useAppSelector(selectSigmets)

  return (
    <LayerGroup>
      {sigmets.map((sigmet) => (
        <Sigmet sigmet={sigmet} key={sigmet.isigmetId} />
      ))}
    </LayerGroup>
  )
}
