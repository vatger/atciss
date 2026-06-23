import { configureStore } from "@reduxjs/toolkit"
import { describe, expect, it } from "vitest"
import { RootState } from "app/store"
import { authReducer } from "app/auth/slice"
import {
  activePositionReducer,
  setPosition,
  setSectorsSyncedToOnline,
} from "./activePositionSlice"
import { api } from "./api"
import { LoaItem } from "types/loa"
import { SectorData } from "types/vatglasses"
import {
  selectLateralBorderSegments,
  selectVerticalBorderGroups,
} from "./loaMapSelectors"

const makeLoa = (overrides: Partial<LoaItem>): LoaItem => ({
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
  ...overrides,
})

const sector = (
  latMin: number,
  lngMin: number,
  latMax: number,
  lngMax: number,
  min: number | null = null,
  max: number | null = null,
) => ({
  points: [
    [latMin, lngMin],
    [latMin, lngMax],
    [latMax, lngMax],
    [latMax, lngMin],
  ] as [number, number][],
  min,
  max,
  runways: [],
})

const buildStore = async (sectorData: SectorData, loas: LoaItem[]) => {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      activePositions: activePositionReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })

  await store.dispatch(
    api.util.upsertQueryData("sectors", undefined, sectorData),
  )
  store.dispatch(setSectorsSyncedToOnline(false))
  store.dispatch(setPosition({ id: "OWNED1", active: true }))
  await store.dispatch(
    api.util.upsertQueryData("loaBySectors", ["OWNED1"], loas),
  )

  return store
}

describe("selectLateralBorderSegments", () => {
  it("returns a segment for a lateral LOA between two side-by-side adjacent sectors", async () => {
    // OWNED1 occupies [0,0]–[1,1]; OTHER1 occupies [0,1]–[1,2]; they share the edge lng=1
    const sectorData: SectorData = {
      airspace: {
        OWNED1: {
          id: "OWNED1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OWNED1"],
          sectors: [sector(0, 0, 1, 1, null, null)],
        },
        OTHER1: {
          id: "OTHER1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OTHER1"],
          sectors: [sector(0, 1, 1, 2, null, null)],
        },
      },
      positions: {},
      airports: {},
    }
    const store = await buildStore(sectorData, [
      makeLoa({ cop: null, vertical: false, level: 100 }),
    ])
    const result = selectLateralBorderSegments(store.getState() as RootState)

    expect(result.length).toBe(1)
    // the shared edge runs from (0,1) to (1,1)
    const points = result[0].segment.map(([lat, lng]) => `${lat},${lng}`)
    expect(points).toContain("0,1")
    expect(points).toContain("1,1")
  })

  it("merges border segments when two groups have geometrically identical sectors but swapped LOA direction", async () => {
    const sectorData: SectorData = {
      airspace: {
        OWNED1: {
          id: "OWNED1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OWNED1"],
          sectors: [sector(0, 0, 1, 1)],
        },
        OTHER1: {
          id: "OTHER1",
          uid: null,
          remark: null,
          group: "g",
          owner: [],
          sectors: [sector(0, 1, 1, 2)],
        },
        OTHER2: {
          id: "OTHER2",
          uid: null,
          remark: null,
          group: "g",
          owner: [],
          sectors: [sector(0, 1, 1, 2)],
        },
      },
      positions: {},
      airports: {},
    }
    const store = await buildStore(sectorData, [
      makeLoa({ from_sector: "OTHER1", to_sector: "OWNED1", level: 100 }),
      makeLoa({ from_sector: "OWNED1", to_sector: "OTHER2", level: 100 }),
    ])
    const result = selectLateralBorderSegments(store.getState() as RootState)
    expect(result.length).toBe(1)
  })

  it("returns no segments when the sectors are not geographically adjacent", async () => {
    const sectorData: SectorData = {
      airspace: {
        OWNED1: {
          id: "OWNED1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OWNED1"],
          sectors: [sector(0, 0, 1, 1)],
        },
        OTHER1: {
          id: "OTHER1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OTHER1"],
          sectors: [sector(10, 10, 11, 11)],
        },
      },
      positions: {},
      airports: {},
    }
    const store = await buildStore(sectorData, [
      makeLoa({ cop: null, vertical: false, level: 100 }),
    ])
    const result = selectLateralBorderSegments(store.getState() as RootState)

    expect(result).toEqual([])
  })
})

describe("selectVerticalBorderGroups", () => {
  it("returns a group with one slice pair for a vertical LOA between vertically adjacent sectors", async () => {
    // OWNED1 covers up to FL195; OTHER1 starts at FL195 — mirroring FRK/BBG
    const sectorData: SectorData = {
      airspace: {
        OWNED1: {
          id: "OWNED1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OWNED1"],
          sectors: [sector(0, 0, 1, 1, null, 195)],
        },
        OTHER1: {
          id: "OTHER1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OTHER1"],
          sectors: [sector(0, 0, 1, 1, 195, null)],
        },
      },
      positions: {},
      airports: {},
    }
    const store = await buildStore(sectorData, [
      makeLoa({ cop: null, vertical: true }),
    ])
    const result = selectVerticalBorderGroups(store.getState() as RootState)

    expect(result.length).toBe(1)
    expect(result[0].polygons.length).toBe(1)
  })

  it("returns no groups when the sectors are not vertically adjacent", async () => {
    const sectorData: SectorData = {
      airspace: {
        OWNED1: {
          id: "OWNED1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OWNED1"],
          sectors: [sector(0, 0, 1, 1, null, 100)],
        },
        OTHER1: {
          id: "OTHER1",
          uid: null,
          remark: null,
          group: "g",
          owner: ["OTHER1"],
          sectors: [sector(0, 0, 1, 1, 200, null)],
        },
      },
      positions: {},
      airports: {},
    }
    const store = await buildStore(sectorData, [
      makeLoa({ cop: null, vertical: true }),
    ])
    const result = selectVerticalBorderGroups(store.getState() as RootState)

    expect(result).toEqual([])
  })
})
