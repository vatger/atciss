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
        borderTopColor: "brightshadow",
        borderLeftColor: "brightshadow",
        background: "inputBackground",
        fontFamily: "body",
        ...props.sx,
      }}
    >
      {props.children}
    </Select>
  )
}
