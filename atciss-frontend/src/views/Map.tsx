import {
  Box,
  Checkbox,
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

const position = [49.2646, 11.4134] as LatLngTuple

const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const { data, isLoading, error } = sectorApi.useGetByRegionQuery("germany")
  const [level, setLevel] = useState("200")
  const levelSliderId = useId()

  const levelFilter = (s: Sector) =>
    (s.min ?? 0) <= level && level < (s.max ?? 999)

  const sectors = data?.airspace
    .filter((a) => a.sectors.some(levelFilter))
    .map(({ id: name, owner, sectors }) => ({
      name,
      owner,
      sector: sectors
        .filter(levelFilter)
        .map(({ points }) =>
          points.map(
            ([lat, lng]) =>
              [parseFloat(lat) / 10000, parseFloat(lng) / 10000] as LatLngTuple,
          ),
        ),
    }))

  const stringToColour = (str: string) => {
    let hash = 0
    str.split("").forEach((char) => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = "#"
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      colour += value.toString(16).padStart(2, "0")
    }
    return colour
  }

  return (
    <Flex
      sx={{
        ...sx,
        gap: "1rem",
        flexGrow: "1",
      }}
    >
      <Box sx={{ flexGrow: "4" }}>
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
          {sectors?.map(({ name, sector }) => (
            <Polygon
              key={name}
              pathOptions={{
                color: stringToColour(name),
                weight: 1,
                opacity: 0.5,
              }}
              positions={sector}
            >
              <Tooltip>{name}</Tooltip>
            </Polygon>
          ))}
        </MapContainer>
      </Box>
      <Flex sx={{ flexDirection: "column" }}>
        <Grid
          sx={{
            flexGrow: "1",
            gap: 3,
            gridAutoFlow: "column",
            justifyContent: "space-evenly",
          }}
        >
          <Label sx={{ fontWeight: "bold" }} htmlFor={levelSliderId}>
            Level
          </Label>
          <Slider
            id={levelSliderId}
            sx={{ display: "block" }}
            min="0"
            max="500"
            step="10"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
          <Box>FL{z3(level)}</Box>
        </Grid>
      </Flex>
    </Flex>
  )
}

export { Map }
