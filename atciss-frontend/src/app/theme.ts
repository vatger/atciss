import type { Theme } from "theme-ui"

export const theme: Theme = {
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#4375a3",
    darkshadow: "#22384c",
    brightshadow: "#9bbbd1",
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
