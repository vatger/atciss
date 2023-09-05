import { Polygon, Tooltip } from "react-leaflet"
import { Box, Text } from "theme-ui"
import { z3 } from "../../app/utils"
import { Sector, sectorApi } from "../../services/airspaceApi"

type SectorPolygonProps = {
  sector: Sector
  name: string
  controllingSector: string
}

export const SectorPolygon = ({
  sector: { points, min, max },
  name,
  controllingSector,
}: SectorPolygonProps) => {
  const { data } = sectorApi.useGetByRegionQuery("germany")

  return (
    <Polygon
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
  )
}
