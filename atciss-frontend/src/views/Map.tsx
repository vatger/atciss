import { Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { MapContainer } from "react-leaflet"
import { LatLngTuple } from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapControls } from "../components/map/MapControls"
import { BackgroundTiles } from "../components/map/BackgroundTiles"
import { SectorLayer } from "../components/map/SectorLayer"
import { AerodromeLayer } from "../components/map/AerodromeLayer"

const position = [49.2646, 11.4134] as LatLngTuple

const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => {
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
        <BackgroundTiles />
        <SectorLayer />
        <AerodromeLayer />
      </MapContainer>
      <Flex sx={{ flexDirection: "column", gap: 3, overflow: "hidden" }}>
        <MapControls />
      </Flex>
    </Grid>
  )
}

export { Map }
