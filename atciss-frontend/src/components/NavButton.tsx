import { Button, ThemeUIStyleObject } from "theme-ui"
import { PropsWithChildren } from "react"

type NavButtonProps = {
  sx?: ThemeUIStyleObject
  onClick?: () => void
}

const NavButton = (props: PropsWithChildren<NavButtonProps>) => (
  <Button
    sx={{
      ...props.sx,
      border: 2,
      borderRadius: 0,
      borderTopColor: "brightshadow",
      borderLeftColor: "brightshadow",
      borderBottomColor: "darkshadow",
      borderRightColor: "darkshadow",
      borderStyle: "solid",
      color: "background",
      px: 2,
      py: 1,
      "&:active": {
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
      },
    }}
    onClick={props.onClick}
  >
    {props.children}
  </Button>
)

export { NavButton }
