import Coordinate from "jsts/org/locationtech/jts/geom/Coordinate.js"
import GeometryFactory from "jsts/org/locationtech/jts/geom/GeometryFactory.js"
import LineString from "jsts/org/locationtech/jts/geom/LineString.js"
import LineMerger from "jsts/org/locationtech/jts/operation/linemerge/LineMerger.js"
import OverlayOp from "jsts/org/locationtech/jts/operation/overlay/OverlayOp.js"
import RelateOp from "jsts/org/locationtech/jts/operation/relate/RelateOp.js"
import L, { LatLngExpression } from "leaflet"
import { Airspace, Sector } from "types/vatglasses"

export const sectorVolumesAtLevel = (
  airspace: Airspace | undefined,
  level: number,
): Sector[] =>
  airspace?.sectors.filter(
    (s) => (s.min ?? 0) <= level && level < (s.max ?? 999),
  ) ?? []

const jstsGeometryFactory = new GeometryFactory()

const toJstsPolygon = (points: LatLngExpression[]) => {
  const coords = points.map((p) => {
    const { lat, lng } = L.latLng(p)
    return new Coordinate(lng, lat)
  })
  const first = coords[0]
  const last = coords[coords.length - 1]
  if (first && last && (first.x !== last.x || first.y !== last.y)) {
    coords.push(first)
  }
  return jstsGeometryFactory.createPolygon(
    jstsGeometryFactory.createLinearRing(coords),
    [],
  )
}

export const verticalBorderPolygons = (
  from: Airspace | undefined,
  to: Airspace | undefined,
): [number, number][][] =>
  (from?.sectors ?? []).flatMap((a) =>
    (to?.sectors ?? [])
      .filter(
        (b) =>
          (a.max !== null && a.max === b.min) ||
          (a.min !== null && a.min === b.max),
      )
      .flatMap((b) => {
        const result = OverlayOp.intersection(
          toJstsPolygon(a.points),
          toJstsPolygon(b.points),
        )
        if (result.isEmpty() || result.getArea() <= 0) return []
        return Array.from({ length: result.getNumGeometries() }, (_, i) =>
          result
            .getGeometryN(i)
            .getExteriorRing()
            .getCoordinates()
            .map((c: Coordinate): [number, number] => [c.y, c.x]),
        )
      }),
  )

const roundCoord = (n: number) => Math.round(n * 100) / 100

const coincidentPoint = (
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number],
): boolean =>
  roundCoord(lat1) === roundCoord(lat2) && roundCoord(lng1) === roundCoord(lng2)

const segmentsCoincide = (
  a: [number, number][],
  b: [number, number][],
): boolean => {
  if (a.length === 0 || a.length !== b.length) return false
  return (
    a.every((p, i) => coincidentPoint(p, b[i])) ||
    a.every((p, i) => coincidentPoint(p, b[b.length - 1 - i]))
  )
}

export const mergeCoincidentSegments = <T>(
  entries: {
    segment: [number, number][]
    exitAgreements: T[]
    entryAgreements: T[]
    key: string
  }[],
): {
  segment: [number, number][]
  exitAgreements: T[]
  entryAgreements: T[]
  key: string
}[] => {
  const result: {
    segment: [number, number][]
    exitAgreements: T[]
    entryAgreements: T[]
    key: string
  }[] = []
  for (const entry of entries) {
    const existing = result.find((r) =>
      segmentsCoincide(r.segment, entry.segment),
    )
    if (existing) {
      existing.exitAgreements.push(...entry.exitAgreements)
      existing.entryAgreements.push(...entry.entryAgreements)
    } else {
      result.push({
        key: entry.key,
        segment: entry.segment,
        exitAgreements: [...entry.exitAgreements],
        entryAgreements: [...entry.entryAgreements],
      })
    }
  }
  return result
}

const toJstsLineString = (coords: [number, number][]) =>
  jstsGeometryFactory.createLineString(
    coords.map(([lat, lng]) => new Coordinate(lng, lat)),
  )

export const removeCoveredSegments = (
  segments: [number, number][][],
): [number, number][][] => {
  const lines = segments.map(toJstsLineString)
  return segments.filter(
    (_, i) =>
      !lines.some(
        (line, j) =>
          j !== i &&
          line.getLength() > lines[i].getLength() &&
          RelateOp.covers(line, lines[i]),
      ),
  )
}

export const findSharedBorder = (
  a: Sector,
  b: Sector,
): [number, number][][] => {
  const intersection = OverlayOp.intersection(
    toJstsPolygon(a.points).getBoundary(),
    toJstsPolygon(b.points).getBoundary(),
  )
  const merger = new LineMerger()
  merger.add(intersection)
  const merged = merger.getMergedLineStrings()
  return merged
    .toArray()
    .map((line: LineString) =>
      line
        .getCoordinates()
        .map((c: Coordinate): [number, number] => [c.y, c.x]),
    )
}
