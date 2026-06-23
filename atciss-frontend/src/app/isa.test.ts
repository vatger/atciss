import { describe, expect, it } from "vitest"

import { pressureToFlightLevelFt, windLevelLabel } from "./isa"

describe("pressureToFlightLevelFt", () => {
  it("is ~0 ft at the standard reference pressure", () => {
    expect(pressureToFlightLevelFt(1013.25)).toBeCloseTo(0, 0)
  })

  it("matches the known 500 hPa / FL180 reference pair", () => {
    const ft = pressureToFlightLevelFt(500)
    expect(ft).toBeGreaterThan(17500)
    expect(ft).toBeLessThan(18500)
  })
})

describe("windLevelLabel", () => {
  it("labels surface level", () => {
    expect(windLevelLabel("surface")).toBe("Surface")
  })

  it("labels a pressure level as its flight level", () => {
    expect(windLevelLabel(500)).toBe("FL180")
  })

  it("rounds to the nearest FL10", () => {
    expect(windLevelLabel(300)).toBe(
      `FL${Math.round(pressureToFlightLevelFt(300) / 1000) * 10}`,
    )
  })

  it("labels a level below 9000ft as rounded feet", () => {
    expect(windLevelLabel(1000)).toBe(
      `${Math.round(pressureToFlightLevelFt(1000) / 100) * 100}ft`,
    )
  })
})
