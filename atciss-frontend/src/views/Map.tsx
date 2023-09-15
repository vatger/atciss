import {
  Flex,
  Grid,
  Input,
  Label,
  Slider,
  Text,
  ThemeUIStyleObject,
} from "theme-ui"
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet"
import { LatLngTuple } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Sector, sectorApi } from "../services/airspaceApi"
import { useId, useState } from "react"
import { SectorChoice } from "../components/map/SectorChoice"
import { useAppSelector } from "../app/hooks"
import {
  selectActivePositions,
  selectSyncedToOnline,
} from "../services/activePositionSlice"
import { SectorPolygon } from "../components/map/SectorPolygon"
import { adApi } from "../services/adApi"
import { selectActiveEbg } from "../services/configSlice"
import { EBG_SETTINGS } from "../app/config"
import { usePollControllers } from "../services/controllerApi"

const position = [49.2646, 11.4134] as LatLngTuple

const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const { data } = sectorApi.useGetByRegionQuery("germany")
  const [level, setLevel] = useState("200")

  usePollControllers()

  const activePositions = useAppSelector(selectActivePositions)
  const syncedToOnline = useAppSelector(selectSyncedToOnline)

  const activeEbg = useAppSelector(selectActiveEbg)

  const levelSliderId = useId()
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

  const levelFilter = (s: Sector) =>
    (s.min ?? 0) <= parseInt(level) && parseInt(level) < (s.max ?? 999)

  const sectors = data?.airspace
    .filter((a) => a.sectors.some(levelFilter))
    .map(({ id: name, owner, sectors }) => ({
      name,
      owner,
      sectors: sectors.filter(levelFilter),
    }))

  return (
    <Grid
      sx={{
        ...sx,
        gap: "1rem",
        gridTemplateColumns: "4fr 1fr",
        width: "100%",
      }}
    >
      <MapContainer
        center={position}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "100%" }}
      >
        {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
        />
        {sectors?.map(({ name, sectors, owner }) => {
          const controllingSector = owner.find((pos) =>
            syncedToOnline
              ? activePositions[pos]?.online
              : activePositions[pos]?.manual,
          )

          return controllingSector
            ? sectors.map((sector, index) => (
                <SectorPolygon
                  key={index}
                  sector={sector}
                  name={name}
                  controllingSector={controllingSector}
                />
              ))
            : []
        })}
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
      </MapContainer>
      <Flex sx={{ flexDirection: "column", gap: 3, overflow: "hidden" }}>
        <Grid
          sx={{
            flex: "none",
            gap: 3,
            gridAutoFlow: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Label sx={{ fontWeight: "bold" }} htmlFor={levelSliderId}>
            Level
          </Label>
          <Slider
            id={levelSliderId}
            sx={{ display: "block" }}
            min="0"
            max="660"
            step="10"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
          <Input
            type="number"
            min="0"
            max="660"
            step="10"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
        </Grid>
        <SectorChoice />
      </Flex>
    </Grid>
  )
}

export { Map }
