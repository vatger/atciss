import { ReactNode } from "react"
import { Flex, ThemeUIStyleObject } from "theme-ui"

export const AtisRow = ({
  children,
  sx,
}: {
  children: ReactNode
  sx?: ThemeUIStyleObject
}) => (
  <Flex sx={{ justifyContent: "space-between", alignItems: "baseline", ...sx }}>
    {children}
  </Flex>
)
