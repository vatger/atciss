import { describe, expect, it } from "vitest"
import { Sector } from "types/vatglasses"

import {
  findSharedBorder,
  mergeCoincidentSegments,
  removeCoveredSegments,
  sectorVolumesAtLevel,
  verticalBorderPolygons,
} from "./borderAgreementGeometry"

const square = (
  latMin: number,
  lngMin: number,
  latMax: number,
  lngMax: number,
  min: number | null = null,
  max: number | null = null,
): Sector => ({
  points: [
    [latMin, lngMin],
    [latMin, lngMax],
    [latMax, lngMax],
    [latMax, lngMin],
  ],
  min,
  max,
  runways: [],
})

describe("sectorVolumesAtLevel", () => {
  it("returns the slice whose [min, max) contains the level", () => {
    const low = square(0, 0, 1, 1, 0, 100)
    const high = square(0, 0, 1, 1, 100, 200)
    const airspace = {
      id: "a",
      uid: null,
      remark: null,
      group: "g",
      owner: [],
      sectors: [low, high],
    }

    expect(sectorVolumesAtLevel(airspace, 50)).toEqual([low])
    expect(sectorVolumesAtLevel(airspace, 100)).toEqual([high])
  })

  it("returns all matching slices when an airspace has multiple volumes in one band", () => {
    const westPiece = square(0, 0, 1, 1, 0, 100)
    const eastPiece = square(0, 1, 1, 2, 0, 100)
    const airspace = {
      id: "a",
      uid: null,
      remark: null,
      group: "g",
      owner: [],
      sectors: [westPiece, eastPiece],
    }

    expect(sectorVolumesAtLevel(airspace, 50)).toEqual([westPiece, eastPiece])
  })

  it("returns an empty array when no slice matches", () => {
    const slice = square(0, 0, 1, 1, 0, 100)
    const airspace = {
      id: "a",
      uid: null,
      remark: null,
      group: "g",
      owner: [],
      sectors: [slice],
    }

    expect(sectorVolumesAtLevel(airspace, 200)).toEqual([])
  })

  it("returns an empty array for an undefined airspace", () => {
    expect(sectorVolumesAtLevel(undefined, 50)).toEqual([])
  })
})

const airspace = (sectors: Sector[]) => ({
  id: "a",
  uid: null,
  remark: null,
  group: "g",
  owner: [],
  sectors,
})

describe("verticalBorderPolygons", () => {
  it("returns the overlap polygon for a vertically adjacent pair", () => {
    const low = square(0, 0, 1, 1, null, 195)
    const high = square(0, 0, 1, 1, 195, null)

    const rings = verticalBorderPolygons(airspace([low]), airspace([high]))
    expect(rings.length).toBe(1)
    const points = rings[0].map(([lat, lng]) => `${lat},${lng}`)
    expect(points).toContain("0,0")
    expect(points).toContain("1,1")
  })

  it("returns the overlap polygon regardless of which side is from/to", () => {
    const low = square(0, 0, 1, 1, null, 195)
    const high = square(0, 0, 1, 1, 195, null)

    const rings = verticalBorderPolygons(airspace([high]), airspace([low]))
    expect(rings.length).toBe(1)
    const points = rings[0].map(([lat, lng]) => `${lat},${lng}`)
    expect(points).toContain("0,0")
    expect(points).toContain("1,1")
  })

  it("returns overlap polygons for all crossing pairs when volumes partially overlap", () => {
    const fromLow = square(0, 0, 1, 1, null, 100)
    const fromHighWest = square(0, 0, 1, 2, 100, 195)
    const fromHighEast = square(0, 1, 1, 3, 100, 195)
    const toLowWest = square(0, 0, 1, 2, 195, 300)
    const toLowEast = square(0, 1, 1, 3, 195, 300)
    const toHigh = square(0, 0, 1, 1, 300, null)

    const rings = verticalBorderPolygons(
      airspace([fromLow, fromHighWest, fromHighEast]),
      airspace([toLowWest, toLowEast, toHigh]),
    )
    expect(rings.length).toBe(4)
  })

  it("returns an empty array when no slice pair is adjacent", () => {
    const a = square(0, 0, 1, 1, null, 100)
    const b = square(0, 0, 1, 1, 200, 300)

    expect(verticalBorderPolygons(airspace([a]), airspace([b]))).toEqual([])
  })

  it("returns an empty array for vertically adjacent sectors with no lateral overlap", () => {
    const west = square(0, 0, 1, 1, null, 195)
    const east = square(0, 2, 1, 3, 195, null)

    expect(verticalBorderPolygons(airspace([west]), airspace([east]))).toEqual(
      [],
    )
  })
})

describe("findSharedBorder", () => {
  it("finds the shared edge between two adjacent sectors", () => {
    const a = square(0, 0, 1, 1)
    const b = square(0, 1, 1, 2)

    const segments = findSharedBorder(a, b)

    expect(segments.length).toBeGreaterThan(0)
    const points = segments.flat().map(([lat, lng]) => `${lat},${lng}`)
    expect(points).toContain("0,1")
    expect(points).toContain("1,1")
  })

  it("returns no segments for non-adjacent sectors", () => {
    const a = square(0, 0, 1, 1)
    const b = square(10, 10, 11, 11)

    expect(findSharedBorder(a, b)).toEqual([])
  })
})

describe("mergeCoincidentSegments", () => {
  it("merges two entries with the identical segment into one with concatenated agreements", () => {
    const segment: [number, number][] = [
      [0, 1],
      [1, 1],
    ]

    const result = mergeCoincidentSegments([
      { key: "ab", segment, exitAgreements: ["a"], entryAgreements: [] },
      { key: "ab", segment, exitAgreements: [], entryAgreements: ["b"] },
    ])

    expect(result).toEqual([
      { key: "ab", segment, exitAgreements: ["a"], entryAgreements: ["b"] },
    ])
  })

  it("merges entries whose segment is reversed", () => {
    const segment: [number, number][] = [
      [0, 1],
      [1, 1],
    ]
    const reversed: [number, number][] = [
      [1, 1],
      [0, 1],
    ]

    const result = mergeCoincidentSegments([
      { key: "ab", segment, exitAgreements: ["a"], entryAgreements: [] },
      {
        key: "ab",
        segment: reversed,
        exitAgreements: [],
        entryAgreements: ["b"],
      },
    ])

    expect(result).toEqual([
      { key: "ab", segment, exitAgreements: ["a"], entryAgreements: ["b"] },
    ])
  })

  it("keeps entries with the same endpoints but a different middle point separate", () => {
    const segmentA: [number, number][] = [
      [0, 1],
      [0.5, 1.5],
      [1, 1],
    ]
    const segmentB: [number, number][] = [
      [0, 1],
      [0.5, 2],
      [1, 1],
    ]

    const result = mergeCoincidentSegments([
      {
        key: "ab",
        segment: segmentA,
        exitAgreements: ["a"],
        entryAgreements: [],
      },
      {
        key: "cd",
        segment: segmentB,
        exitAgreements: ["b"],
        entryAgreements: [],
      },
    ])

    expect(result).toEqual([
      {
        key: "ab",
        segment: segmentA,
        exitAgreements: ["a"],
        entryAgreements: [],
      },
      {
        key: "cd",
        segment: segmentB,
        exitAgreements: ["b"],
        entryAgreements: [],
      },
    ])
  })

  it("keeps entries with different segments separate", () => {
    const segmentA: [number, number][] = [
      [0, 1],
      [1, 1],
    ]
    const segmentB: [number, number][] = [
      [5, 5],
      [6, 6],
    ]

    const result = mergeCoincidentSegments([
      {
        key: "ab",
        segment: segmentA,
        exitAgreements: ["a"],
        entryAgreements: [],
      },
      {
        key: "cd",
        segment: segmentB,
        exitAgreements: ["b"],
        entryAgreements: [],
      },
    ])

    expect(result).toEqual([
      {
        key: "ab",
        segment: segmentA,
        exitAgreements: ["a"],
        entryAgreements: [],
      },
      {
        key: "cd",
        segment: segmentB,
        exitAgreements: ["b"],
        entryAgreements: [],
      },
    ])
  })
})

describe("removeCoveredSegments", () => {
  it("drops a shorter segment fully covered by a longer collinear one", () => {
    const long: [number, number][] = [
      [50, 11],
      [62, 11],
    ]
    const short: [number, number][] = [
      [60, 11],
      [62, 11],
    ]

    expect(removeCoveredSegments([long, short])).toEqual([long])
    expect(removeCoveredSegments([short, long])).toEqual([long])
  })

  it("keeps disjoint segments that don't cover one another", () => {
    const a: [number, number][] = [
      [0, 1],
      [1, 1],
    ]
    const b: [number, number][] = [
      [5, 5],
      [6, 6],
    ]

    expect(removeCoveredSegments([a, b])).toEqual([a, b])
  })

  it("finds only the two non-redundant borders for two pairs of overlapping sector pieces", () => {
    const ownedA = square(50, 10, 62, 11)
    const ownedB = square(60, 10, 63, 11)
    const otherA = square(50, 11, 62, 12)
    const otherB = square(60, 11, 63, 12)

    const segments = removeCoveredSegments([
      ...findSharedBorder(ownedA, otherA),
      ...findSharedBorder(ownedA, otherB),
      ...findSharedBorder(ownedB, otherA),
      ...findSharedBorder(ownedB, otherB),
    ])

    expect(segments).toHaveLength(2)
  })
})
