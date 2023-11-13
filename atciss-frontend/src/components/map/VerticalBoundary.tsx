/** @jsxImportSource theme-ui */

import { useState } from "react"
import { Marker, useMap, useMapEvent } from "react-leaflet"
import { z3 } from "../../app/utils"
import { createPortal } from "react-dom"
import L, { LatLngExpression } from "leaflet"

export const VerticalBoundary = ({
  min,
  max,
  center,
  color,
}: {
  min: number | null
  max: number | null
  center: LatLngExpression | null
  color: string
}) => {
  const [zoom, setZoom] = useState(0)

  const icon = color && (
    <div className="marker-label" sx={{ filter: "brightness(.5)", color }}>
      <div sx={{ borderBottom: `1px solid ${color}` }}>{!!max && z3(max)}</div>
      <div>{!!min && z3(min)}</div>
    </div>
  )

  const element = L.DomUtil.create("div")

  const divIcon = L.divIcon({
    html: element,
    className: "",
    iconSize: [22, 14],
  })

  const map = useMap()
  useMapEvent("zoomend", () => setZoom(map.getZoom()))

  return (
    center &&
    zoom > 8 && (
      <>
        {createPortal(icon, element)}
        <Marker position={center as LatLngExpression} icon={divIcon}>
          <>Test</>
        </Marker>
      </>
    )
  )
}
