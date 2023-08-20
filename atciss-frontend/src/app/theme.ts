import type { Theme } from "theme-ui"

export const theme: Theme = {
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#0082b3",
    darkshadow: "#003e59",
    brightshadow: "#90c6da",
  },
  text: {
    atisXL: {
      color: "primary",
      fontSize: "6",
      fontWeight: "bold",
    },
    atisL: {
      color: "primary",
      fontSize: "5",
    },
    label: {
      fontWeight: "bold",
      fontFamily: "sans-serif",
    },
    primary: {
      color: "primary",
    },
  },
  space: ["0px", "4px", "8px", "16px", "32px", "48px", "64px"],
}
