import { expect, test } from "vitest"
import { page } from "vitest/browser"
import {
  renderMapWithProviders,
  setupAuthToken,
  stubApiEndpoints,
} from "./testUtils"

test("wind layer toggle mounts a leaflet-velocity canvas on the map", async () => {
  setupAuthToken()

  const restoreFetch = stubApiEndpoints({
    airspace: JSON.stringify({ airspace: {}, positions: {}, airports: {} }),
  })

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
