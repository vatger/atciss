/** @jsxImportSource theme-ui */

import { useAppSelector } from "app/hooks"
import { z3 } from "app/utils"
import { Tooltip } from "components/atciss/map/Tooltip"
import { VerticalBoundary } from "components/atciss/map/VerticalBoundary"
import { LatLng, LatLngTuple } from "leaflet"
import { DateTime } from "luxon"
import { useState } from "react"
import { LayerGroup, Polygon, Polyline } from "react-leaflet"
import { selectActiveFir, selectNeighbourFirs } from "services/configSlice"
import { selectSigmets, usePollSigmet } from "services/sigmetApi"
import { Box, Text } from "theme-ui"
import { Sigmet as SigmetType } from "types/wx"

const pathOptions = {
  color: "#ff0",
  weight: 5,
  opacity: 1,
  fillOpacity: 0.5,
}

const Sigmet = ({ sigmet }: { sigmet: SigmetType }) => {
  const [center, setCenter] = useState<LatLng | null>(null)

  const start = DateTime.fromISO(sigmet.validTimeFrom).toUTC()
  const end = DateTime.fromISO(sigmet.validTimeTo).toUTC()
  const active = DateTime.utc() >= start && DateTime.utc() <= end

  if (!active) {
    return null
  }

  const tooltip = (
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
  )
  const verticalBoundary = (
    <VerticalBoundary
      min={(sigmet.base ?? 0) / 100}
      max={(sigmet.top ?? 0) / 100}
      center={center}
      color="#ff0"
    />
  )

  if (sigmet.geom === "LINE") {
    return (
      <Polyline
        pathOptions={pathOptions}
        positions={sigmet.coords as LatLngTuple[]}
        eventHandlers={{
          add: (p) => setCenter(p.target.getCenter()),
        }}
      >
        {verticalBoundary}
        {tooltip}
      </Polyline>
    )
  }

  if (sigmet.geom === "AREAS") {
    return (
      <>
        {(sigmet.coords as LatLngTuple[][]).map((ring, i) => (
          <Polygon
            // eslint-disable-next-line @eslint-react/no-array-index-key -- anonymous polygon ring has no id; list is replaced wholesale, never reordered
            key={i}
            pathOptions={pathOptions}
            positions={ring}
            eventHandlers={
              i === 0 ? { add: (p) => setCenter(p.target.getCenter()) } : {}
            }
          >
            {i === 0 && verticalBoundary}
            {i === 0 && tooltip}
          </Polygon>
        ))}
      </>
    )
  }

  return (
    <Polygon
      pathOptions={pathOptions}
      positions={sigmet.coords as LatLngTuple[]}
      eventHandlers={{
        add: (p) => setCenter(p.target.getCenter()),
      }}
    >
      {verticalBoundary}
      {tooltip}
    </Polygon>
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
