import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useRccState } from "./useRccState"

describe("useRccState", () => {
  it("only reports the currently selected runway after switching away from another one", () => {
    const { result } = renderHook(() => useRccState())

    act(() => {
      result.current.selectAirport("EDDC")
    })
    act(() => {
      result.current.toggleRunway("04", ["22"])
    })
    act(() => {
      result.current.setEasyCondition("04", {
        conditionCode: 6,
        deposit: "dry",
        coverage: 100,
      })
    })

    act(() => {
      result.current.toggleRunway("22", ["04"])
    })
    act(() => {
      result.current.setEasyCondition("22", {
        conditionCode: 5,
        deposit: "wet",
        coverage: 100,
      })
    })

    expect(result.current.selectedRunways).toEqual(["22"])
    expect(result.current.conditions["04"]).toBeDefined()

    act(() => {
      result.current.generate()
    })

    expect(result.current.conditionString).toContain("RWY 22")
    expect(result.current.conditionString).not.toContain("RWY 04")
  })

  it("deselects a runway when it is toggled again", () => {
    const { result } = renderHook(() => useRccState())

    act(() => {
      result.current.selectAirport("EDDC")
    })
    act(() => {
      result.current.toggleRunway("04", ["22"])
    })
    expect(result.current.selectedRunways).toEqual(["04"])

    act(() => {
      result.current.toggleRunway("04", ["22"])
    })
    expect(result.current.selectedRunways).toEqual([])
  })
})
