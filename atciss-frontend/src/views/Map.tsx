import {
  Box,
  Button,
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
import { ChangeEventHandler, useEffect, useId, useState } from "react"
import { z3 } from "../app/utils"

const position = [49.2646, 11.4134] as LatLngTuple

const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const { data, isSuccess, error } = sectorApi.useGetByRegionQuery("germany")
  const [level, setLevel] = useState("200")
  const [activePositions, setActivePositions] = useState<{
    [id: string]: boolean
  }>({})

  const levelSliderId = useId()

  useEffect(() => {
    if (isSuccess && data) {
      setActivePositions(
        Object.keys(data.positions)
          .filter((id) => !["MMC", "WWC", "GGC"].includes(id))
          .reduce(
            (acc, id) => ({ ...acc, [id]: true }),
            {} as { [id: string]: boolean },
          ),
      )
    }
  }, [data, isSuccess])

  const levelFilter = (s: Sector) =>
    (s.min ?? 0) <= parseInt(level) && parseInt(level) < (s.max ?? 999)

  const sectors = data?.airspace
    .filter((a) => a.sectors.some(levelFilter))
    .map(({ id: name, owner, sectors }) => ({
      name,
      owner,
      sectors: sectors.filter(levelFilter).map(({ min, max, points }) => ({
        min,
        max,
        points: points.map(
          ([lat, lng]) =>
            [parseFloat(lat) / 10000, parseFloat(lng) / 10000] as LatLngTuple,
        ),
      })),
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

  const activePositionChanged: (
    id: string,
  ) => ChangeEventHandler<HTMLInputElement> = (id) => (e) => {
    setActivePositions({ ...activePositions, [id]: e.target.checked })
  }

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

          return controllingSector ? (
            sectors.map(({ points, min, max }) => (
              <Polygon
                key={name}
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
          ) : (
            <></>
          )
        })}
      </MapContainer>
      <Flex sx={{ flexDirection: "column", gap: 3, overflow: "hidden" }}>
        <Grid
          sx={{
            flexGrow: "1",
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
        <Flex sx={{ justifyContent: "space-between" }}>
          <Button
            onClick={() =>
              setActivePositions(
                Object.keys(activePositions).reduce(
                  (acc, key) => ({ ...acc, [key]: true }),
                  {},
                ),
              )
            }
          >
            Select All
          </Button>
          <Button
            onClick={() =>
              setActivePositions(
                Object.keys(activePositions).reduce(
                  (acc, key) => ({ ...acc, [key]: false }),
                  {},
                ),
              )
            }
          >
            Deselect All
          </Button>
        </Flex>
        <Flex sx={{ flexWrap: "wrap", overflow: "auto" }}>
          {data &&
            Object.keys(activePositions).length &&
            Object.entries(
              Object.entries(data.positions)
                .filter(([id]) => !["MMC", "WWC", "GGC"].includes(id))
                .reduce((acc, [id, p]) => {
                  return {
                    ...acc,
                    [p.pre[0]]: [...(acc[p.pre[0]] ?? []), id],
                  }
                }, {} as { [index: string]: string[] }),
            ).map(([group, positions]) => (
              <>
                <Text
                  variant="label"
                  sx={{ marginTop: 2, marginBottom: 1, flexBasis: "100%" }}
                >
                  {group}
                </Text>
                {positions.map((id) => (
                  <Flex key={id} sx={{ flexBasis: "50%" }}>
                    <Label>
                      <Checkbox
                        checked={activePositions[id]}
                        onChange={activePositionChanged(id)}
                      />
                      {id}
                    </Label>
                  </Flex>
                ))}
              </>
            ))}
        </Flex>
      </Flex>
    </Grid>
  )
}

export { Map }
