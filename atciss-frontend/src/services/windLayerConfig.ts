// German FIR (EDGG/EDWW/EDMM) plus margin
export const WIND_BBOX = {
  latMin: 46,
  latMax: 56,
  lonMin: 4,
  lonMax: 16,
}

// DWD's global ICON run: a good density/payload-size tradeoff for a
// browser-fetched bounding-box query (the EU/D2 domains return 4x/40x more
// points over this bbox).
export const WIND_MODEL = "icon_global"

const grayscale = (steps: number, from: number, to: number) =>
  Array.from({ length: steps }, (_, i) => {
    const v = Math.round(from + ((to - from) * i) / (steps - 1))
    return `rgb(${v},${v},${v})`
  })

const DARK_COLOR_SCALE = grayscale(13, 230, 120)
const LIGHT_COLOR_SCALE = grayscale(13, 10, 110)

export const windColorScale = (isLightTheme: boolean) =>
  isLightTheme ? LIGHT_COLOR_SCALE : DARK_COLOR_SCALE
