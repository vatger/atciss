import {
  Box,
  Flex,
  Grid,
  Input,
  Label,
  Slider,
  Text,
  ThemeUIStyleObject,
} from "theme-ui"
import { MapContainer, Polygon, TileLayer, Tooltip } from "react-leaflet"
import { LatLngTuple } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Sector, sectorApi } from "../services/airspaceApi"
import { useId, useState } from "react"
import { z3 } from "../app/utils"
import { SectorChoice } from "../components/map/SectorChoice"
import { useAppSelector } from "../app/hooks"
import { selectActivePositions } from "../services/activePositionSlice"

const position = [49.2646, 11.4134] as LatLngTuple

const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const { data } = sectorApi.useGetByRegionQuery("germany")
  const [level, setLevel] = useState("200")

  const activePositions = useAppSelector(selectActivePositions)

  const levelSliderId = useId()

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
          const controllingSector = owner.find((pos) => activePositions[pos])

          return controllingSector
            ? sectors.map(({ points, min, max }, index) => (
                <Polygon
                  key={`${name}-${min}-${max}-${index}`}
                  pathOptions={{
                    color: data?.positions[controllingSector].colours[0].hex,
                    weight: 1,
                    opacity: 0.5,
                  }}
                  positions={points}
                >
                  <Tooltip>
                    <Box>
                      <Text variant="label">{name}</Text> by {controllingSector}
                    </Box>
                    <Box>
                      FL{z3(min ?? 0)}-FL{z3(max ?? 660)}
                    </Box>
                  </Tooltip>
                </Polygon>
              ))
            : []
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
