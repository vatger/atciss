/** @jsxImportSource theme-ui */

import { Select, SelectProps } from "theme-ui"
import { PropsWithChildren } from "react"

export const XmSelect = (props: PropsWithChildren<SelectProps>) => {
  return (
    <Select
      {...props}
      sx={{
        border: 2,
        borderRadius: 0,
        borderStyle: "solid",
        px: 2,
        py: 1,
        borderBottomColor: "darkshadow",
        borderRightColor: "darkshadow",
        borderTopColor: "#d6d6d6",
        borderLeftColor: "#d6d6d6",
        ...props.sx,
      }}
    >
      {props.children}
    </Select>
  )
}
