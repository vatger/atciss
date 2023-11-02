/** @jsxImportSource theme-ui */

import { Button, ButtonProps } from "theme-ui"
import { PropsWithChildren } from "react"

export const XmButton = (props: PropsWithChildren<ButtonProps>) => {
  return (
    <Button
      {...props}
      sx={{
        border: 2,
        borderRadius: 0,
        borderTopColor: "brightshadow",
        borderLeftColor: "brightshadow",
        borderBottomColor: "darkshadow",
        borderRightColor: "darkshadow",
        borderStyle: "solid",
        px: 2,
        py: 1,
        "&:active": {
          borderTopColor: "darkshadow",
          borderLeftColor: "darkshadow",
          borderBottomColor: "brightshadow",
          borderRightColor: "brightshadow",
        },
      }}
    >
      {props.children}
    </Button>
  )
}
