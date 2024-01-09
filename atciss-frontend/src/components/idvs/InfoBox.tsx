import { ReactNode } from "react"
import { Box, ThemeUIStyleObject } from "theme-ui"

export const InfoBox = ({
  sx,
  children,
}: {
  sx?: ThemeUIStyleObject
  children: ReactNode
}) => {
  return (
    <Box
      sx={{
        cursor: "default",
        px: 2,
        fontSize: 4,
        backgroundColor: "primary",
        border: "inset 2px",
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
