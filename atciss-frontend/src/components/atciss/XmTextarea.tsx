/** @jsxImportSource theme-ui */

import { Textarea, TextareaProps } from "theme-ui"
import { PropsWithChildren } from "react"

export const XmTextarea = (props: PropsWithChildren<TextareaProps>) => {
  return (
    <Textarea
      {...props}
      sx={{
        border: 2,
        borderRadius: 0,
        borderStyle: "solid",
        px: 2,
        py: 1,
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
        background: "inputBackground",
        fontFamily: "body",
        ...props.sx,
      }}
    >
      {props.children}
    </Textarea>
  )
}
