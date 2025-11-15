import { useTheme } from "@emotion/react"
import type { Theme } from "theme-ui"

export type AtcissTheme = Theme & {
  colors: {
    text: string
    background: string
    primary: string
    darkshadow: string
    brightshadow: string
  }
}

export const useAtcissTheme = useTheme as () => AtcissTheme

export const theme: AtcissTheme = {
  colors: {
    text: "#000",
    invertedText: "#fff",
    background: "#eaeaea",
    inputBackground: "#fff",
    primary: "#0082b3",
    secondary: "#a0e6fa",
    primaryText: "var(--theme-ui-colors-background)",
    clockBackground: "#565964",
    clockText: "#fff",
    darkshadow: "#5c5c5c",
    darkshadowNav: "#003e59",
    brightshadow: "#ddd",
    brightshadowNav: "#90c6da",
    green: "#007711",
    red: "#770011",
    orange: "#b97700",
    purple: "#770077",
    modes: {
      dark: {
        text: "#fff",
        invertedText: "#000",
        background: "#222",
        inputBackground: "#000",
        primary: "#90c6da",
        secondary: "#0082b3",
        darkshadow: "#5c5c5c",
        darkshadowNav: "#003e59",
        brightshadow: "#ddd",
        brightshadowNav: "#a0e6fa",
        green: "#33ff99",
        red: "#ff7788",
        orange: "#ffa333",
        purple: "#ff55ff",
      },
    },
  },
  fonts: {
    body: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    heading:
      "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    monospace:
      "'Source Code Pro', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
  styles: {
    a: {
      color: "text",
    },
  },
  text: {
    atisXL: {
      color: "primary",
      fontSize: "5",
      fontWeight: "bold",
    },
    atisL: {
      color: "primary",
      fontSize: "4",
    },
    label: {
      fontWeight: "bold",
      fontFamily:
        "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    },
    primary: {
      color: "primary",
    },
    primaryLabel: {
      color: "primary",
      fontWeight: "bold",
      fontFamily:
        "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    },
    mapAd: {
      color: "primary",
      fontSize: "3",
      fontWeight: "bold",
    },
    clock: {
      fontWeight: "bold",
      fontFamily: "monospace",
      fontSize: 5,
      letterSpacing: ".15rem",
    },
    clockMinSecSep: {
      display: "none",
    },
    clockSec: {
      fontSize: 3,
    },
  },
  breakpoints: ["32em", "48em", "64em"],
  cards: {
    footer: {
      border: 2,
      borderStyle: "solid",
      p: 1,
      px: 4,
      borderTopColor: "darkshadow",
      borderLeftColor: "darkshadow",
      borderBottomColor: "brightshadow",
      borderRightColor: "brightshadow",
    },
  },
  buttons: {
    primary: {
      color: "background",
      bg: "primary",
      border: 2,
      borderRadius: 0,
      borderTopColor: "brightshadow",
      borderLeftColor: "brightshadow",
      borderBottomColor: "darkshadow",
      borderRightColor: "darkshadow",
      borderStyle: "solid",
      backgroundColor: "primary",
      px: 2,
      py: 1,
      "&:active": {
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
      },
    },
    nav: {
      height: "100%",
      width: "100%",
      border: 2,
      borderRadius: 0,
      borderTopColor: "brightshadowNav",
      borderLeftColor: "brightshadowNav",
      borderBottomColor: "darkshadowNav",
      borderRightColor: "darkshadowNav",
      borderStyle: "solid",
      backgroundColor: "primary",
      color: "background",
      px: 2,
      py: 1,
      "&:active": {
        borderTopColor: "darkshadowNav",
        borderLeftColor: "darkshadowNav",
        borderBottomColor: "brightshadowNav",
        borderRightColor: "brightshadowNav",
      },
    },
    secondaryNav: {
      border: 2,
      borderRadius: 0,
      borderTopColor: "brightshadowNav",
      borderLeftColor: "brightshadowNav",
      borderBottomColor: "darkshadowNav",
      borderRightColor: "darkshadowNav",
      borderStyle: "solid",
      color: "text",
      backgroundColor: "secondary",
      p: 1,
      fontSize: 1,
      "&:active": {
        borderTopColor: "darkshadowNav",
        borderLeftColor: "darkshadowNav",
        borderBottomColor: "brightshadowNav",
        borderRightColor: "brightshadowNav",
      },
    },
    selectedSecondaryNav: {
      border: 2,
      borderRadius: 0,
      borderTopColor: "brightshadowNav",
      borderLeftColor: "brightshadowNav",
      borderBottomColor: "darkshadowNav",
      borderRightColor: "darkshadowNav",
      borderStyle: "solid",
      color: "background",
      backgroundColor: "green",
      p: 1,
      fontSize: 1,
      "&:active": {
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
      },
    },
  },
  badges: {
    primary: {
      backgroundColor: "primary",
      color: "invertedText",
    },
    fresh: {
      backgroundColor: "orange",
      color: "invertedText",
    },
  },
  space: ["0px", "4px", "8px", "16px", "32px", "48px", "64px"],
}
