import L from "leaflet"
import { useMapEvent } from "react-leaflet"

// fixes leaflet opening incorrect tooltips whilst panning the map
export const TooltipDragFix = () => {
  useMapEvent("tooltipopen", (e) => {
    const source = (e.tooltip as L.Tooltip & { _source?: L.Layer })._source as
      (L.Layer & { getElement?: () => HTMLElement | undefined }) | undefined
    const el = source?.getElement?.()
    if (el && !el.matches(":hover")) {
      e.tooltip.close()
    }
  })
  return null
}
