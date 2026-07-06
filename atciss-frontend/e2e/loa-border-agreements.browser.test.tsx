import { expect, test } from "vitest"
import {
  renderMapWithProviders,
  setupAuthToken,
  stubApiEndpoints,
} from "./testUtils"

test("LOA toggle renders a dashed border line and a hatched border area", async () => {
  setupAuthToken()
  // Use manually-set active positions rather than the VATSIM-online-synced
  // default, so owning OWNED1 doesn't depend on a stubbed controller list.
  window.localStorage.setItem(
    "activePositions.sectorsSyncedToOnline",
    JSON.stringify(false),
  )

  const airspaceBody = JSON.stringify({
    airspace: {
      OWNED1: {
        id: "OWNED1",
        uid: null,
        remark: null,
        group: "g",
        owner: ["OWNED1"],
        sectors: [
          {
            points: [
              [50, 10],
              [50, 11],
              [62, 11],
              [62, 10],
            ],
            min: 0,
            max: 195,
            runways: [],
          },
          // A second piece sharing the same band, partially overlapping the
          // first (lat 60–62), bordering the corresponding piece of OTHER1.
          // The single OWNED1<->OTHER1 agreement must render the border
          // contributed by all crossing piece-pairs, not just the first.
          {
            points: [
              [60, 10],
              [60, 11],
              [63, 11],
              [63, 10],
            ],
            min: 0,
            max: 195,
            runways: [],
          },
        ],
      },
      OTHER1: {
        id: "OTHER1",
        uid: null,
        remark: null,
        group: "g",
        owner: [],
        sectors: [
          {
            points: [
              [50, 11],
              [50, 12],
              [62, 12],
              [62, 11],
            ],
            min: 0,
            max: 195,
            runways: [],
          },
          {
            points: [
              [60, 11],
              [60, 12],
              [63, 12],
              [63, 11],
            ],
            min: 0,
            max: 195,
            runways: [],
          },
        ],
      },
      OTHER2: {
        id: "OTHER2",
        uid: null,
        remark: null,
        group: "g",
        owner: [],
        sectors: [
          {
            points: [
              [50, 10.5],
              [50, 11.5],
              [51, 11.5],
              [51, 10.5],
            ],
            min: 195,
            max: 315,
            runways: [],
          },
        ],
      },
      // OWNED3 and OTHER3 each have two altitude bands sharing the same
      // lateral footprint (unlike OWNED1/OTHER1's geographically-disjoint
      // pieces above). The two lateral LoaItems below are at different
      // levels, so they land in separate groups, but both groups compute
      // the identical line segment between these footprints. That line must
      // render once, not twice stacked on top of each other, and its
      // tooltip must include both agreements.
      OWNED3: {
        id: "OWNED3",
        uid: null,
        remark: null,
        group: "g",
        owner: ["OWNED3"],
        sectors: [
          {
            points: [
              [70, 10],
              [70, 11],
              [71, 11],
              [71, 10],
            ],
            min: 0,
            max: 105,
            runways: [],
          },
          {
            points: [
              [70, 10],
              [70, 11],
              [71, 11],
              [71, 10],
            ],
            min: 105,
            max: 205,
            runways: [],
          },
        ],
      },
      OTHER3: {
        id: "OTHER3",
        uid: null,
        remark: null,
        group: "g",
        owner: [],
        sectors: [
          {
            points: [
              [70, 11],
              [70, 12],
              [71, 12],
              [71, 11],
            ],
            min: 0,
            max: 105,
            runways: [],
          },
          {
            points: [
              [70, 11],
              [70, 12],
              [71, 12],
              [71, 11],
            ],
            min: 105,
            max: 205,
            runways: [],
          },
        ],
      },
    },
    positions: {
      OWNED1: {
        id: "OWNED1",
        name: "Owned Sector",
        pre: ["OWN"],
        type: "CTR",
        frequency: "123.100",
        callsign: "OWNED1_CTR",
        colours: [{ hex: "#ff0000" }],
      },
    },
    airports: {},
  })

  const loaBody = JSON.stringify([
    {
      from_sector: "OWNED1",
      to_sector: "OTHER1",
      ades: null,
      adep: null,
      cop: null,
      runway: null,
      route_before: null,
      route_after: null,
      level: 100,
      sfl: null,
      qnh: null,
      level_at: null,
      transfer_type: null,
      releases: null,
      remarks: null,
      areas: null,
      rfl: null,
      vertical: false,
    },
    {
      from_sector: "OTHER1",
      to_sector: "OWNED1",
      ades: null,
      adep: null,
      cop: null,
      runway: null,
      route_before: null,
      route_after: null,
      level: 100,
      sfl: null,
      qnh: null,
      level_at: null,
      transfer_type: null,
      releases: null,
      remarks: null,
      areas: null,
      rfl: null,
      vertical: false,
    },
    {
      from_sector: "OWNED1",
      to_sector: "OTHER2",
      ades: null,
      adep: null,
      cop: null,
      runway: null,
      route_before: null,
      route_after: null,
      level: 190,
      sfl: null,
      qnh: null,
      level_at: null,
      transfer_type: null,
      releases: null,
      remarks: null,
      areas: null,
      rfl: null,
      vertical: true,
    },
    {
      from_sector: "OTHER2",
      to_sector: "OWNED1",
      ades: null,
      adep: null,
      cop: null,
      runway: null,
      route_before: null,
      route_after: null,
      level: 200,
      sfl: null,
      qnh: null,
      level_at: null,
      transfer_type: null,
      releases: null,
      remarks: null,
      areas: null,
      rfl: null,
      vertical: true,
    },
    {
      from_sector: "OWNED3",
      to_sector: "OTHER3",
      ades: null,
      adep: null,
      cop: null,
      runway: null,
      route_before: null,
      route_after: null,
      level: 50,
      sfl: null,
      qnh: null,
      level_at: null,
      transfer_type: null,
      releases: null,
      remarks: null,
      areas: null,
      rfl: null,
      vertical: false,
    },
    {
      from_sector: "OWNED3",
      to_sector: "OTHER3",
      ades: null,
      adep: null,
      cop: null,
      runway: null,
      route_before: null,
      route_after: null,
      level: 150,
      sfl: null,
      qnh: null,
      level_at: null,
      transfer_type: null,
      releases: null,
      remarks: null,
      areas: null,
      rfl: null,
      vertical: false,
    },
  ])

  const restoreFetch = stubApiEndpoints({
    airspace: airspaceBody,
    loa: loaBody,
  })

  const pageErrors: string[] = []
  window.addEventListener("error", (e) => pageErrors.push(e.message))

  try {
    const screen = await renderMapWithProviders()

    await screen.getByRole("button", { name: "LOA", exact: true }).click()

    await expect
      .poll(
        () =>
          screen.container.querySelectorAll(
            ".leaflet-loaBorderLines-pane path[stroke-dasharray]",
          ).length,
        { timeout: 15000 },
      )
      .toBeGreaterThan(0)

    await expect
      .poll(
        () =>
          screen.container.querySelectorAll(
            '.leaflet-loaBorderAreas-pane path[fill^="url("]',
          ).length,
        { timeout: 15000 },
      )
      .toBeGreaterThan(0)

    // Both the lateral and vertical agreements above are described by two
    // LoaItems each (one per traffic direction), and the vertical agreements
    // differ on level (190 vs 200), showing climbing/descending agreements
    // for a border at FL195. They must still render as exactly one polygon,
    // not doubled up. The lateral OWNED1<->OTHER1 agreement renders two lines:
    // one for the lat 50–62 border (piece 1 pair) and one for the lat 60–63
    // border, proving border rendering isn't limited to the first
    // matching piece pair. OWNED3<->OTHER3 is described by two LoaItems at
    // different levels that resolve to the identical line (their sectors share
    // a lateral footprint across altitude bands), it must render as one line,
    // not two stacked on top of each other, for a total of three.
    const lateralLines = screen.container.querySelectorAll(
      ".leaflet-loaBorderLines-pane path[stroke-dasharray]",
    )
    expect(lateralLines.length).toBe(3)
    expect(
      screen.container.querySelectorAll(
        '.leaflet-loaBorderAreas-pane path[fill^="url("]',
      ).length,
    ).toBe(1)

    expect(pageErrors).toEqual([])
  } finally {
    restoreFetch()
  }
})
