import { Box, Grid, ThemeUIStyleObject } from "theme-ui"

const AtisAfw = ({ sx }: { sx: ThemeUIStyleObject }) => (
  <Grid
    sx={{
      ...sx,
      gridTemplate: "3fr 2fr / 2fr 1fr 2fr",
    }}
  >
    <Box sx={{ gridColumnEnd: "span 2" }}>atis</Box>
    <Box>notes</Box>
    <Box>areas</Box>
    <Box>sectors</Box>
    <Box>ADs</Box>
  </Grid>
)

export { AtisAfw }
