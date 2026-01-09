import { ReactNode } from "react"
import { Box, ThemeUIStyleObject } from "theme-ui"

export const InfoBox = ({
  sx,
  title,
  children,
}: {
  sx?: ThemeUIStyleObject
  title?: string
  children: ReactNode
}) => {
  return (
    <Box
      title={title}
      sx={{
        cursor: "default",
        py: 0,
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
