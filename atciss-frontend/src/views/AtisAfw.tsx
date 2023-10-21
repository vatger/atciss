import { Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { Atis } from "../components/Atis"
import { ADinfo } from "../components/ADInfo"
import { SectorStatus } from "../components/SectorStatus"
import { ECFMP } from "../components/ECFMP"
import { Events } from "../components/Events"
import { Areas } from "../components/Areas"

const gridItemSx: ThemeUIStyleObject = {
  padding: "1",
  backgroundColor: "white",
}

const AtisAfw = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  return (
    <Grid
      sx={{
        ...sx,
        gridTemplate: "3fr 2fr / 2fr 1fr 2fr",
        gap: "2px",
        backgroundColor: "red",
      }}
    >
      <Atis
        sx={{
          ...gridItemSx,
          gridColumnEnd: "span 2",
          padding: 0,
        }}
      />
      <Flex
        sx={{
          flexDirection: "column",
          overflow: "auto",
          ...gridItemSx,
        }}
      >
        <ECFMP />
        <Events />
      </Flex>
      <Areas sx={gridItemSx} />
      <SectorStatus sx={gridItemSx} />
      <ADinfo sx={{ ...gridItemSx, padding: 0 }} />
    </Grid>
  )
}

export { AtisAfw }
