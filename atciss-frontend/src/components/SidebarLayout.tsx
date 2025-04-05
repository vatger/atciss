import { ReactNode } from "react"
import { Grid, ThemeUIStyleObject } from "theme-ui"

export const SidebarLayout = ({
  children,
  sx,
}: {
  children: ReactNode
  sx?: ThemeUIStyleObject
}) => (
  <Grid
    sx={{
      gap: 1,
      gridTemplateColumns: "4fr 25rem",
      width: "100%",
      height: "100%",
      overflowY: "auto",
      ...sx,
    }}
  >
    {children}
  </Grid>
)
