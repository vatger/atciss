import { useAppDispatch, useAppSelector } from "app/hooks"
import L from "leaflet"
import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import {
  selectOpenFlightmapsOnMap,
  selectWindLevel,
  selectWindOnMap,
} from "services/mapSlice"
import { REFRESH_INTERVAL_MS, windApi } from "services/windApi"
import { windColorScale } from "services/windLayerConfig"
import { useColorMode } from "theme-ui"

const DISPLAY_OPTIONS = {
  velocityType: "Wind",
  position: "topright" as const,
  emptyString: "No wind data",
  speedUnit: "kt" as const,
}

export const WindLayer = () => {
  const map = useMap()
  const dispatch = useAppDispatch()
  const windOnMap = useAppSelector(selectWindOnMap)
  const windLevel = useAppSelector(selectWindLevel)
  const ofm = useAppSelector(selectOpenFlightmapsOnMap)
  const [colorMode] = useColorMode()
  // OFM is a light basemap regardless of the app's dark/light theme, so
  // render the particle field as if light theme were active whenever it's on.
  // State (not just the ref) so the colorScale-update effect below can
  // depend on it and react to theme changes on an existing layer.
  const isLightTheme = ofm || colorMode === "default"
  // Mirrors isLightTheme without being a dependency of the layer-build
  // effect, so refresh() can read the current theme when constructing a
  // new layer without that effect re-running (and rebuilding/refetching)
  // on every theme toggle.
  const isLightThemeRef = useRef(isLightTheme)
  isLightThemeRef.current = isLightTheme
  const layerRef = useRef<L.VelocityLayer | null>(null)
  const [pluginReady, setPluginReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      ;(window as unknown as { L: typeof L }).L = L
      await import("leaflet-velocity")
      if (!cancelled) setPluginReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const skip = !pluginReady || !windOnMap
  const { data } = useAppSelector(windApi.endpoints.windGrid.select(windLevel))

  // Subscribe/poll via a manually dispatched `initiate` (rather than the
  // `useWindGridQuery` hook) so the cleanup can call `.abort()` when the
  // level slider is dragged quickly across several levels.
  useEffect(() => {
    if (skip) return
    const result = dispatch(
      windApi.endpoints.windGrid.initiate(windLevel, {
        subscriptionOptions: { pollingInterval: REFRESH_INTERVAL_MS },
      }),
    )
    return () => {
      result.unsubscribe()
      result.abort()
    }
  }, [dispatch, windLevel, skip])

  // Build/update the particle layer whenever fresh velocity data arrives.
  useEffect(() => {
    if (!data) return
    if (layerRef.current) {
      layerRef.current.setData(data)
    } else {
      const layer = L.velocityLayer({
        data,
        paneName: "wind",
        colorScale: windColorScale(isLightThemeRef.current),
        displayOptions: DISPLAY_OPTIONS,
        lineWidth: 3,
        velocityScale: 0.003,
        particleMultiplier: 1 / 1000,
      })
      layer.addTo(map)
      layerRef.current = layer
    }
  }, [data, map])

  // Show/hide the layer on toggle. Hide rather than destroy: keep the layer
  // and its last-fetched data around so turning Wind back on doesn't need a
  // full rebuild (RTK Query's cache covers refetching if data went stale).
  useEffect(() => {
    if (!layerRef.current) return
    if (windOnMap) {
      layerRef.current.addTo(map)
    } else {
      map.removeLayer(layerRef.current)
    }
  }, [windOnMap, map])

  useEffect(() => {
    layerRef.current?.setOptions({ colorScale: windColorScale(isLightTheme) })
  }, [isLightTheme])

  useEffect(
    () => () => {
      layerRef.current?.remove()
      layerRef.current = null
    },
    [map],
  )

  return null
}
