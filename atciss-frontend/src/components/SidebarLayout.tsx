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
      ...sx,
      gap: 1,
      gridTemplateColumns: "4fr 1fr",
      width: "100%",
    }}
  >
    {children}
  </Grid>
)
