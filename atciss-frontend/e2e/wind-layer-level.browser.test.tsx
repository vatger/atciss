import { fireEvent } from "@testing-library/react"
import { expect, test } from "vitest"
import { WIND_LEVELS } from "services/mapSlice"
import {
  renderMapWithProviders,
  setupAuthToken,
  stubApiEndpoints,
} from "./testUtils"

// Adds an artificial delay before resolving so a rapid second slider move
// has a chance to abort the first request before it would otherwise settle
// (mirrors a real, non-instant network round trip).
const stubWindEndpoint = (delayMs = 0) => {
  const realFetch = window.fetch.bind(window)
  const calls: { url: string; signal?: AbortSignal }[] = []
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    if (!url.includes("wx.glob.in")) return realFetch(input, init)
    // fetchBaseQuery builds a `Request` and calls `fetchFn(request)` with a
    // single argument, so the abort signal lives on `input`, not `init`.
    const signal = (input instanceof Request ? input.signal : init?.signal) as
      | AbortSignal
      | undefined
    calls.push({ url, signal })
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs))
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError")
    }
    return new Response(
      JSON.stringify([{ latitude: 50, longitude: 5, current: {}, hourly: {} }]),
      { status: 200, headers: { "content-type": "application/json" } },
    )
  }) as typeof window.fetch
  return {
    calls,
    urls: calls.map((c) => c.url),
    restore: () => (window.fetch = realFetch),
  }
}

test("moving the level slider refetches wind data for the new level, aborting obsolete in-flight requests", async () => {
  setupAuthToken()

  const restoreFetch = stubApiEndpoints({
    airspace: JSON.stringify({ airspace: {}, positions: {}, airports: {} }),
  })
  const wind = stubWindEndpoint(50)

  try {
    const screen = await renderMapWithProviders()

    await screen.getByRole("button", { name: "Wind", exact: true }).click()

    await expect
      .poll(() => wind.calls.some((c) => c.url.includes("wind_speed_10m")), {
        timeout: 15000,
      })
      .toBe(true)

    // The level slider only renders once the wind layer is active
    // (MapControls renders WindLevelChoice behind `wind && ...`), so wait
    // for it rather than assuming it's already mounted right after the
    // click resolves. The map also renders an unrelated flight-level slider
    // (LevelChoice) at all times, so select the wind one specifically by
    // its `max` (WIND_LEVELS.length - 1), not just any `input[type=range]`.
    const windSliderSelector = `input[type="range"][max="${WIND_LEVELS.length - 1}"]`
    await expect
      .poll(() => screen.container.querySelector(windSliderSelector), {
        timeout: 15000,
      })
      .not.toBeNull()

    const slider = screen.container.querySelector(
      windSliderSelector,
    ) as HTMLInputElement
    fireEvent.change(slider, { target: { value: "1" } })

    await expect
      .poll(() => wind.calls.some((c) => c.url.includes("hourly=")), {
        timeout: 15000,
      })
      .toBe(true)

    // Drag through several more levels faster than the (artificially
    // delayed) requests resolve, each level change should abort the
    // previous level's still-pending fetch rather than letting it complete.
    const callsBeforeDrag = wind.calls.length
    fireEvent.change(slider, { target: { value: "2" } })
    fireEvent.change(slider, { target: { value: "3" } })
    fireEvent.change(slider, { target: { value: "4" } })

    await expect
      .poll(() => wind.calls.length >= callsBeforeDrag + 3, {
        timeout: 15000,
      })
      .toBe(true)

    const obsoleteCalls = wind.calls.slice(callsBeforeDrag, -1)
    await expect
      .poll(() => obsoleteCalls.every((call) => call.signal?.aborted), {
        timeout: 5000,
      })
      .toBe(true)
    expect(wind.calls.at(-1)?.signal?.aborted).toBe(false)
  } finally {
    wind.restore()
    restoreFetch()
  }
})
