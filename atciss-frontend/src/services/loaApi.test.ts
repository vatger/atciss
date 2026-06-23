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
import { selectBorderAgreements, selectGroupedBorderAgreements } from "./loaApi"
import { LoaItem } from "types/loa"
import { SectorData } from "types/vatglasses"

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

const sectorData: SectorData = {
  airspace: {
    OWNED1: {
      id: "OWNED1",
      uid: null,
      remark: null,
      group: "g",
      owner: ["OWNED1"],
      sectors: [],
    },
  },
  positions: {},
  airports: {},
}

const buildStore = async () => {
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

  return store
}

describe("selectBorderAgreements", () => {
  it("returns only the cop:null agreements among the owned sector's relevant LOAs", async () => {
    const store = await buildStore()
    const waypointLoa = makeLoa({ cop: "ABCDE" })
    const borderLoa = makeLoa({ cop: null, vertical: true })

    await store.dispatch(
      api.util.upsertQueryData(
        "loaBySectors",
        ["OWNED1"],
        [waypointLoa, borderLoa],
      ),
    )

    const result = selectBorderAgreements(store.getState() as RootState)

    expect(result).toEqual([borderLoa])
  })
})

describe("selectGroupedBorderAgreements", () => {
  it("combines opposite-direction lateral agreements at the same level into one group", async () => {
    const store = await buildStore()
    const exitLoa = makeLoa({
      from_sector: "OWNED1",
      to_sector: "OTHER1",
      level: 100,
      vertical: false,
    })
    const entryLoa = makeLoa({
      from_sector: "OTHER1",
      to_sector: "OWNED1",
      level: 100,
      vertical: false,
    })

    await store.dispatch(
      api.util.upsertQueryData("loaBySectors", ["OWNED1"], [exitLoa, entryLoa]),
    )

    const result = selectGroupedBorderAgreements(store.getState() as RootState)

    expect(result).toEqual([
      {
        from_sector: "OWNED1",
        to_sector: "OTHER1",
        vertical: false,
        level: 100,
        exitAgreements: [exitLoa],
        entryAgreements: [entryLoa],
      },
    ])
  })

  it("combines vertical agreements with different levels at the same border", async () => {
    const store = await buildStore()
    const climbingLoa = makeLoa({
      from_sector: "OWNED1",
      to_sector: "OTHER1",
      level: 190,
      vertical: true,
    })
    const descendingLoa = makeLoa({
      from_sector: "OTHER1",
      to_sector: "OWNED1",
      level: 200,
      vertical: true,
    })

    await store.dispatch(
      api.util.upsertQueryData(
        "loaBySectors",
        ["OWNED1"],
        [climbingLoa, descendingLoa],
      ),
    )

    const result = selectGroupedBorderAgreements(store.getState() as RootState)

    expect(result).toEqual([
      {
        from_sector: "OWNED1",
        to_sector: "OTHER1",
        vertical: true,
        level: null,
        exitAgreements: [climbingLoa],
        entryAgreements: [descendingLoa],
      },
    ])
  })

  it("keeps lateral agreements at different levels in separate groups", async () => {
    const store = await buildStore()
    const lowLoa = makeLoa({
      from_sector: "OWNED1",
      to_sector: "OTHER1",
      level: 100,
      vertical: false,
    })
    const highLoa = makeLoa({
      from_sector: "OWNED1",
      to_sector: "OTHER1",
      level: 200,
      vertical: false,
    })

    await store.dispatch(
      api.util.upsertQueryData("loaBySectors", ["OWNED1"], [lowLoa, highLoa]),
    )

    const result = selectGroupedBorderAgreements(store.getState() as RootState)

    expect(result).toEqual([
      {
        from_sector: "OWNED1",
        to_sector: "OTHER1",
        vertical: false,
        level: 100,
        exitAgreements: [lowLoa],
        entryAgreements: [],
      },
      {
        from_sector: "OWNED1",
        to_sector: "OTHER1",
        vertical: false,
        level: 200,
        exitAgreements: [highLoa],
        entryAgreements: [],
      },
    ])
  })

  it("returns a single-entry group for an ungrouped agreement", async () => {
    const store = await buildStore()
    const loa = makeLoa({ from_sector: "OWNED1", to_sector: "OTHER1" })

    await store.dispatch(
      api.util.upsertQueryData("loaBySectors", ["OWNED1"], [loa]),
    )

    const result = selectGroupedBorderAgreements(store.getState() as RootState)

    expect(result).toEqual([
      {
        from_sector: "OWNED1",
        to_sector: "OTHER1",
        vertical: false,
        level: 100,
        exitAgreements: [loa],
        entryAgreements: [],
      },
    ])
  })
})
