import { configureStore } from "@reduxjs/toolkit"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { describe, expect, it } from "vitest"
import { authReducer } from "app/auth/slice"
import { activePositionReducer } from "services/activePositionSlice"
import { api } from "services/api"
import { LoaItem } from "types/loa"

import { LoaTooltipTable } from "./LoaTooltipTable"

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

const buildStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      activePositions: activePositionReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })

const renderTooltip = ({
  exitAgreements,
  entryAgreements,
}: {
  exitAgreements: LoaItem[]
  entryAgreements: LoaItem[]
}) =>
  render(
    <Provider store={buildStore()}>
      <LoaTooltipTable
        exitAgreements={exitAgreements}
        entryAgreements={entryAgreements}
      />
    </Provider>,
  )

describe("LoaTooltipTable", () => {
  it("renders Exit and Entry headers", () => {
    const exitLoa = makeLoa({ from_sector: "OWNED1", to_sector: "OTHER1" })
    const entryLoa = makeLoa({ from_sector: "OTHER1", to_sector: "OWNED1" })

    renderTooltip({
      exitAgreements: [exitLoa],
      entryAgreements: [entryLoa],
    })

    expect(screen.getByText("Exit")).toBeInTheDocument()
    expect(screen.getByText("Entry")).toBeInTheDocument()
  })

  it("renders only the Exit header when there are no Entry agreements", () => {
    const exitLoa = makeLoa({ from_sector: "OWNED1", to_sector: "OTHER1" })

    renderTooltip({ exitAgreements: [exitLoa], entryAgreements: [] })

    expect(screen.getByText("Exit")).toBeInTheDocument()
    expect(screen.queryByText("Entry")).not.toBeInTheDocument()
  })
})
