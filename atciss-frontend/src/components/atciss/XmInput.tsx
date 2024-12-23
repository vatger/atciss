/** @jsxImportSource theme-ui */

import { Input, InputProps } from "theme-ui"
import { PropsWithChildren } from "react"

export const XmInput = (props: PropsWithChildren<InputProps>) => {
  return (
    <Input
      {...props}
      sx={{
        border: 2,
        borderRadius: 0,
        borderStyle: "solid",
        px: 2,
        py: 1,
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "#d6d6d6",
        borderRightColor: "#d6d6d6",
        ...props.sx,
      }}
    >
      {props.children}
    </Input>
  )
}
