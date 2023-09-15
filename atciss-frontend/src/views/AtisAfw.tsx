import { Box, Grid, ThemeUIStyleObject } from "theme-ui"
import { Atis } from "../components/Atis"
import { ADinfo } from "../components/ADInfo"
import { SectorStatus } from "../components/SectorStatus"

const AtisAfw = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  return (
    <Grid
      sx={{
        ...sx,
        gridTemplate: "3fr 2fr / 2fr 1fr 2fr",
      }}
    >
      <Atis sx={{ gridColumnEnd: "span 2" }} />
      <Box>notes</Box>
      <Box>areas</Box>
      <SectorStatus />
      <ADinfo />
    </Grid>
  )
}

export { AtisAfw }
