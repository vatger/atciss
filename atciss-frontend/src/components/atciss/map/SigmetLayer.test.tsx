import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Sigmet as SigmetType } from "types/wx"

import { Sigmet } from "./SigmetLayer"

vi.mock("react-leaflet", () => ({
  LayerGroup: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="layer-group">{children}</div>
  ),
  Polygon: ({
    positions,
    children,
  }: {
    positions: unknown
    children?: React.ReactNode
  }) => (
    <div data-testid="polygon" data-positions={JSON.stringify(positions)}>
      {children}
    </div>
  ),
  Polyline: ({
    positions,
    children,
  }: {
    positions: unknown
    children?: React.ReactNode
  }) => (
    <div data-testid="polyline" data-positions={JSON.stringify(positions)}>
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}))

vi.mock("components/atciss/map/VerticalBoundary", () => ({
  VerticalBoundary: () => null,
}))

const baseSigmet: SigmetType = {
  isigmetId: "FAJA-D01",
  icaoId: "FAOR",
  firId: "FAJA",
  receiptTime: "2026-06-20T10:13:30.633Z",
  validTimeFrom: "2000-01-01T00:00:00.000Z",
  validTimeTo: "2999-01-01T00:00:00.000Z",
  seriesId: "D01",
  hazard: "TURB",
  qualifier: "SEV",
  base: 3000,
  top: 6500,
  geom: "AREA",
  dir: null,
  spd: null,
  chng: null,
  coords: [
    [-31.083, 28.75],
    [-32.25, 30.9],
    [-32.35, 30.85],
    [-31.133, 28.65],
    [-31.083, 28.75],
  ],
  rawSigmet:
    "WSZA21 FAOR 201746\nFAJA SIGMET D01 VALID 201800/202200 FAOR-\n" +
    "FAJA JOHANNESBURG FIR SEV TURB FCST WI\n" +
    "S3105 E02845 - S3215 E03054 - S3221 E03051 - S3108 E02839 SFC/FL065=",
}

describe("Sigmet", () => {
  it("renders an AREA sigmet as a single Polygon", () => {
    render(<Sigmet sigmet={baseSigmet} />)

    const polygons = screen.getAllByTestId("polygon")
    expect(polygons).toHaveLength(1)
    expect(JSON.parse(polygons[0].dataset.positions ?? "")).toEqual(
      baseSigmet.coords,
    )
    expect(screen.queryByTestId("polyline")).not.toBeInTheDocument()
  })

  it("renders a LINE sigmet as a Polyline, not a Polygon", () => {
    const lineSigmet: SigmetType = {
      ...baseSigmet,
      geom: "LINE",
      coords: [
        [-4.5, 164.2],
        [-0.017, 162.667],
      ],
    }

    render(<Sigmet sigmet={lineSigmet} />)

    expect(screen.queryByTestId("polygon")).not.toBeInTheDocument()
    const polyline = screen.getByTestId("polyline")
    expect(JSON.parse(polyline.dataset.positions ?? "")).toEqual(
      lineSigmet.coords,
    )
  })

  it("renders an AREAS sigmet as one Polygon per ring, each with a tooltip", () => {
    const areasSigmet: SigmetType = {
      ...baseSigmet,
      geom: "AREAS",
      coords: [
        [
          [8.0, 14.15],
          [1.45, 14.15],
          [1.45, 16.15],
          [8.0, 16.15],
          [8.0, 14.15],
        ],
        [
          [6.38, 13.58],
          [0.78, 13.58],
          [0.78, 11.58],
          [6.38, 11.58],
          [6.38, 13.58],
        ],
        [
          [1.45, 17.32],
          [-1.53, 16.33],
          [-1.53, 18.33],
          [1.45, 19.32],
          [1.45, 17.32],
        ],
      ],
    }

    render(<Sigmet sigmet={areasSigmet} />)

    const polygons = screen.getAllByTestId("polygon")
    expect(polygons).toHaveLength(3)
    polygons.forEach((polygon, i) => {
      expect(JSON.parse(polygon.dataset.positions ?? "")).toEqual(
        areasSigmet.coords[i],
      )
    })
    expect(screen.getAllByTestId("tooltip")).toHaveLength(3)
  })

  it("renders tooltip content with FIR, hazard, levels, and raw text", () => {
    render(<Sigmet sigmet={baseSigmet} />)

    expect(screen.getByText(/FAJA SEV TURB/)).toBeInTheDocument()
    expect(screen.getByText(/FL030-FL065/)).toBeInTheDocument()
    expect(screen.getByText(/SIGMET D01 VALID/)).toBeInTheDocument()
  })

  it("renders nothing once the sigmet has expired", () => {
    const expiredSigmet: SigmetType = {
      ...baseSigmet,
      validTimeFrom: "2000-01-01T00:00:00.000Z",
      validTimeTo: "2000-01-02T00:00:00.000Z",
    }

    const { container } = render(<Sigmet sigmet={expiredSigmet} />)

    expect(container).toBeEmptyDOMElement()
  })
})
