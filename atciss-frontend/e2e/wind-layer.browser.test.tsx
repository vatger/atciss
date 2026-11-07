import { expect, test } from "vitest"
import { page } from "vitest/browser"
import {
  renderMapWithProviders,
  setupAuthToken,
  stubApiEndpoints,
} from "./testUtils"

const stubWindGrid = () => {
  const patchedFetch = window.fetch
  const lats = [46, 51, 56]
  const lons = [4, 10, 16]
  const grid = lats.flatMap((latitude) =>
    lons.map((longitude) => ({
      latitude,
      longitude,
      hourly: { wind_speed_10m: [5], wind_direction_10m: [270] },
    })),
  )
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    if (!url.includes("wx.glob.in")) return patchedFetch(input, init)
    return new Response(JSON.stringify(grid), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }) as typeof window.fetch
  return () => {
    window.fetch = patchedFetch
  }
}

test("wind layer toggle mounts a leaflet-velocity canvas on the map", async () => {
  setupAuthToken()

  const restoreApiFetch = stubApiEndpoints({
    airspace: JSON.stringify({ airspace: {}, positions: {}, airports: {} }),
  })
  const restoreWindFetch = stubWindGrid()
  const restoreFetch = () => {
    restoreWindFetch()
    restoreApiFetch()
  }

  const pageErrors: string[] = []
  window.addEventListener("error", (e) => pageErrors.push(e.message))

  try {
    const screen = await renderMapWithProviders()

    await screen.getByRole("button", { name: "Wind", exact: true }).click()

    await expect
      .poll(() => screen.container.querySelector(".leaflet-wind-pane canvas"), {
        timeout: 15000,
      })
      .not.toBeNull()

    const canvas = screen.container.querySelector(".leaflet-wind-pane canvas")
    if (canvas) {
      await expect.element(page.elementLocator(canvas)).toBeVisible()
    }

    expect(pageErrors).toEqual([])
  } finally {
    restoreFetch()
  }
})
