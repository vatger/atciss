import { Box, Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import { LatLngTuple } from "leaflet"
import "leaflet/dist/leaflet.css"

const position = [49.2646, 11.4134] as LatLngTuple

const Map = ({ sx }: { sx?: ThemeUIStyleObject }) => (
  <Flex
    sx={{
      ...sx,
      gap: "1rem",
      flexGrow: "1",
    }}
  >
    <Box sx={{ flexGrow: "1" }}>
      <MapContainer
        center={position}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
    <Box sx={{ flexBasis: "20%" }}>notes</Box>
  </Flex>
)

export { Map }
