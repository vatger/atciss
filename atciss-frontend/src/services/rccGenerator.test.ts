import { describe, expect, it, vi } from "vitest"
import { RunwayCondition, RunwayConditions } from "types/rcc"

import { generateRcc } from "./rccGenerator"

const third = (
  conditionCode: number,
  deposit: RunwayCondition["deposit"],
  coverage: number,
): RunwayCondition => ({ conditionCode, deposit, coverage })

const uniform = (condition: RunwayCondition): RunwayConditions => ({
  tdz: { ...condition },
  mid: { ...condition },
  end: { ...condition },
})

describe("generateRcc", () => {
  it("returns undefined when there are no runways", () => {
    expect(generateRcc({})).toBeUndefined()
  })

  it("skips runways with an incomplete third", () => {
    const result = generateRcc({
      "07L": {
        tdz: third(5, "wet", 100),
        mid: third(5, "wet", 100),
        end: { conditionCode: 5 },
      },
    })

    expect(result).toBeUndefined()
  })

  it("collapses a uniform dry runway to a single RWYCC line without a deposit line", () => {
    vi.setSystemTime(new Date("2026-01-01T10:23:00Z"))

    const result = generateRcc({ "25R": uniform(third(6, "dry", 100)) })

    expect(result).toBe("RWY COND RWY 25R AT TIME 1020 RWYCC 6")

    vi.useRealTimers()
  })

  it("collapses matching deposit and coverage to TOTAL RWY even with a split RWYCC", () => {
    vi.setSystemTime(new Date("2026-01-01T06:07:00Z"))

    const result = generateRcc({
      "09": {
        tdz: third(5, "frost", 75),
        mid: third(4, "frost", 75),
        end: third(4, "frost", 75),
      },
    })

    expect(result).toBe(
      "RWY COND RWY 09 AT TIME 0600 RWYCC TDZ 5 MID 4 END 4 DEPOSIT TOTAL RWY FROST 75 PCT",
    )

    vi.useRealTimers()
  })

  it("reports each third individually when deposit or coverage differ, skipping dry thirds", () => {
    vi.setSystemTime(new Date("2026-01-01T14:59:00Z"))

    const result = generateRcc({
      "16C": {
        tdz: third(6, "dry", 100),
        mid: third(4, "wet_snow", 50),
        end: third(3, "slippery_wet", 75),
      },
    })

    expect(result).toBe(
      "RWY COND RWY 16C AT TIME 1450 RWYCC TDZ 6 MID 4 END 3 DEPOSIT MID WET SNOW 50 PCT END SLIPPERY WET 75 PCT",
    )

    vi.useRealTimers()
  })

  it("joins multiple complete runways on separate lines", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))

    const result = generateRcc({
      "07L": uniform(third(6, "dry", 100)),
      "25R": uniform(third(5, "wet", 100)),
    })

    expect(result).toBe(
      "RWY COND RWY 07L AT TIME 0000 RWYCC 6\nRWY COND RWY 25R AT TIME 0000 RWYCC 5 DEPOSIT TOTAL RWY WET 100 PCT",
    )

    vi.useRealTimers()
  })
})
