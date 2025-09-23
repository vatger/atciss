// import { createSelector } from "@reduxjs/toolkit"
// import { api } from "services/api"
// import { RootState } from "../app/store"
// import { selectAirportICAOs } from "services/aerodrome"

// export const usePollTafByIcaoCodes: typeof api.useTafByIcaoCodesQuery = (
//   icao,
//   options,
// ) => api.useTafByIcaoCodesQuery(icao, { pollingInterval: 60000, ...options })

// const selectByIcaoCodes = createSelector(
//   selectAirportICAOs,
//   api.endpoints.tafByIcaoCodes.select,
// )
// const selectAllTafs = createSelector(
//   (state: RootState) => state,
//   selectByIcaoCodes,
//   (state, selector) => selector(state)?.data ?? {},
// )
//
// export const selectTaf = createSelector(
//   (state: RootState) => state,
//   selectAllTafs,
//   (_state: RootState, icao: string) => icao,
//   (state, tafs, icao) =>
//     tafs[icao ?? ""] ??
//     api.endpoints.tafByIcaoCodes.select([icao])(state)?.data?.[icao ?? ""],
// )
