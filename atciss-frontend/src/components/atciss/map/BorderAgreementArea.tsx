import { useAppSelector } from "app/hooks"
import { LoaTooltipTable } from "components/atciss/LoaTooltipTable"
import { Tooltip } from "components/atciss/map/Tooltip"
import L from "leaflet"
import { memo, useEffect, useMemo, useState } from "react"
import { Polygon, useMap } from "react-leaflet"
import { selectOpenFlightmapsOnMap } from "services/mapSlice"
import { useColorMode } from "theme-ui"
import { LoaItem } from "types/loa"

const BorderAgreementAreaComponent = ({
  exitAgreements,
  entryAgreements,
  polygons,
}: {
  exitAgreements: LoaItem[]
  entryAgreements: LoaItem[]
  polygons: [number, number][][]
}) => {
  const map = useMap()
  const [colorMode] = useColorMode()
  const ofm = useAppSelector(selectOpenFlightmapsOnMap)
  const isLightTheme = ofm || colorMode === "default"
  const [pluginReady, setPluginReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      ;(window as unknown as { L: typeof L }).L = L
      await import("leaflet.pattern")
      if (!cancelled) setPluginReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const pattern = useMemo(
    () =>
      pluginReady
        ? L.stripePattern({
            weight: 4,
            spaceWeight: 6,
            color: isLightTheme ? "#000" : "#fff",
            opacity: 0.8,
            angle: 45,
          })
        : null,
    [pluginReady, isLightTheme],
  )

  useEffect(() => {
    if (!pattern) return
    // leaflet.pattern's L.Map.addInitHook only sets up `_patterns` on maps
    // constructed after the plugin module has loaded; since we load the
    // plugin lazily (after react-leaflet has already created the map), the
    // existing map instance never got that init hook, so addPattern's
    // `this._patterns[id]` would otherwise throw on undefined.
    const mapWithPatterns = map as unknown as {
      _patterns?: Record<number, unknown>
    }
    mapWithPatterns._patterns ??= {}
    pattern.addTo(map)
    return () => {
      pattern.remove()
    }
  }, [pattern, map])

  if (!pattern) return null

  return (
    <>
      {polygons.map((ring, index) => (
        <Polygon
          // eslint-disable-next-line @eslint-react/no-array-index-key
          key={`${index}`}
          positions={ring}
          pathOptions={{
            fillPattern: pattern,
            stroke: true,
            color: isLightTheme ? "#000" : "#fff",
            dashArray: "4 4",
          }}
        >
          <Tooltip>
            <LoaTooltipTable
              exitAgreements={exitAgreements}
              entryAgreements={entryAgreements}
            />
          </Tooltip>
        </Polygon>
      ))}
    </>
  )
}

export const BorderAgreementArea = memo(BorderAgreementAreaComponent)
