import { describe, expect, it } from "vitest"

import { WIND_BBOX, WIND_MODEL, windColorScale } from "./windLayerConfig"

describe("WIND_BBOX", () => {
  it("has min strictly below max on both axes", () => {
    expect(WIND_BBOX.latMin).toBeLessThan(WIND_BBOX.latMax)
    expect(WIND_BBOX.lonMin).toBeLessThan(WIND_BBOX.lonMax)
  })
})

describe("WIND_MODEL", () => {
  it("is a non-empty model identifier", () => {
    expect(WIND_MODEL.length).toBeGreaterThan(0)
  })
})

describe("windColorScale", () => {
  it("returns different scales for light and dark themes", () => {
    const light = windColorScale(true)
    const dark = windColorScale(false)
    expect(light).not.toEqual(dark)
    expect(light.length).toBeGreaterThan(0)
    expect(dark.length).toBeGreaterThan(0)
  })
})
