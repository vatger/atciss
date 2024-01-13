import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { selectFirAllAerodromes } from "services/configSlice"
import { selectSectorData } from "services/sectorApi"
import { Airport } from "types/vatglasses"
import { RootState } from "../app/store"

const emptyAirports: { [indicator: string]: Airport } = {}
export const selectAirports = createSelector(
  selectSectorData,
  (sectorDataResponse) => sectorDataResponse.data?.airports ?? emptyAirports,
)
const selectVatglassesAirportICAOs = createSelector(
  selectAirports,
  (airports) => Object.keys(airports),
)
export const selectAirportICAOs = createSelector(
  selectVatglassesAirportICAOs,
  selectFirAllAerodromes,
  (vatglassesAds, firAds) => [...new Set([...vatglassesAds, ...firAds])],
)
export const selectAirport = createSelector(
  selectAirports,
  (_state: RootState, id: string) => id,
  (airports, icao) => airports[icao ?? ""],
)

const selectByIcaoCodes = createSelector(
  selectAirportICAOs,
  api.endpoints.aerodromesByIcaos.select,
)
const selectAllDfsAds = createSelector(
  (state: RootState) => state,
  selectByIcaoCodes,
  (state, selector) => selector(state)?.data ?? {},
)

export const selectDfsAd = createSelector(
  (state: RootState) => state,
  selectAllDfsAds,
  (_state: RootState, icao: string) => icao,
  (state, ads, icao) =>
    ads[icao ?? ""] ??
    api.endpoints.aerodromesByIcaos.select([icao])(state)?.data?.[icao ?? ""],
)
