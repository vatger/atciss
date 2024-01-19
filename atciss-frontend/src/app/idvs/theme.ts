import { useTheme } from "@emotion/react"
import type { Theme } from "theme-ui"

export type IdvsTheme = Theme & {
  colors: {
    text: string
    background: string
    primary: string
    darkshadow: string
    brightshadow: string
  }
}

export const useIdvsTheme = useTheme as () => IdvsTheme

export const theme: IdvsTheme = {
  colors: {
    text: "#000",
    background: "#aaa",
    primary: "#ccc",
    secondary: "#a0e6fa",
    primaryText: "var(--theme-ui-colors-text)",
    clockBackground: "var(--theme-ui-colors-primary)",
    darkshadow: "#333",
    brightshadow: "#eee",
    green: "#007711",
    red: "#770011",
    orange: "#b97700",
    purple: "#770077",
    modes: {
      dark: {
        text: "#fff",
        background: "#333",
        primary: "#555",
        secondary: "#0082b3",
        brightshadow: "#ccc",
        darkshadow: "#111",
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
      fontSize: 4,
      letterSpacing: 5,
    },
    clockMin: {
      fontSize: 6,
    },
  },
  buttons: {
    primary: {
      color: "text",
      bg: "background",
      fontSize: 3,
      border: 2,
      borderRadius: 0,
      borderTopColor: "brightshadow",
      borderLeftColor: "brightshadow",
      borderBottomColor: "darkshadow",
      borderRightColor: "darkshadow",
      borderStyle: "solid",
      backgroundColor: "background",
      px: 2,
      py: 0,
      "&:active:not(:disabled)": {
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
      },
      "&:disabled": {
        cursor: "not-allowed",
        color: "darkshadow",
      },
    },
    nav: {
      height: "100%",
      width: "100%",
      border: 2,
      borderRadius: 0,
      borderTopColor: "brightshadow",
      borderLeftColor: "brightshadow",
      borderBottomColor: "darkshadow",
      borderRightColor: "darkshadow",
      borderStyle: "solid",
      backgroundColor: "background",
      color: "text",
      px: 2,
      py: 1,
      "&:active:not(:disabled)": {
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
      },
    },
  },
  space: ["0px", "4px", "8px", "16px", "32px", "48px", "64px"],
}
