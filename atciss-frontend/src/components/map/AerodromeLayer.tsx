import { LayerGroup, Tooltip } from "react-leaflet"
import { useAppSelector } from "../../app/hooks"
import { selectActivePositions } from "../../services/activePositionSlice"
import { sectorApi } from "../../services/airspaceApi"
import { usePollControllers } from "../../services/controllerApi"
import { selectActiveEbg } from "../../services/configSlice"
import { adApi } from "../../services/adApi"
import { EBG_SETTINGS } from "../../app/config"
import { CircleMarker } from "react-leaflet"
import { Text } from "theme-ui"

export const AerodromeLayer = () => {
  const { data } = sectorApi.useGetByRegionQuery("germany")
  usePollControllers()

  const activeEbg = useAppSelector(selectActiveEbg)

  const { data: aerodromes } = adApi.useGetByIcaoCodesQuery([
    ...new Set(
      [
        ...EBG_SETTINGS[activeEbg].majorAerodromes,
        ...EBG_SETTINGS[activeEbg].aerodromes,
        ...EBG_SETTINGS[activeEbg].minorAerodromes,
        ...Object.keys(data?.airports ?? {}),
      ].filter((ad) => ad.startsWith("ED")),
    ),
  ])
  const activePositions = useAppSelector(selectActivePositions)

  return (
    <LayerGroup>
      {Object.values(aerodromes ?? {}).map((ad) => {
        const station = data?.airports?.[
          ad.locationIndicatorICAO
        ]?.topdown?.find((pos) => activePositions[pos])
        return (
          <CircleMarker
            center={[ad.latitude, ad.longitude]}
            radius={3}
            key={ad.locationIndicatorICAO}
          >
            <Tooltip>
              <Text variant="label">{ad.locationIndicatorICAO}</Text>
              {station ? ` by ${station}` : ""}
            </Tooltip>
          </CircleMarker>
        )
      })}
    </LayerGroup>
  )
}
