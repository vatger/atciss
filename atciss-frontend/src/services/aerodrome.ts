import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { selectFirAllAerodromes } from "services/configSlice"
import { selectSectorData } from "services/sectorApi"
import { Airport } from "types/vatglasses"
import { RootState } from "../app/store"

const emptyAirports: Record<string, Airport> = {}
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

export const selectAerodromesWithPrefixes = createSelector(
  (state: RootState) => state,
  (_state: RootState, prefixes: string[]) => prefixes,
  (state: RootState, prefixes: string[]) =>
    api.endpoints.aerodromesByPrefixes.select(prefixes)(state)?.data ?? {},
)

export const selectAerodromesWithMetarFromPrefixes = createSelector(
  (state: RootState) => state,
  selectAerodromesWithPrefixes,
  (state, ads) =>
    Object.entries(
      api.endpoints.metarsByIcaoCodes.select(Object.keys(ads))(state).data ??
        {},
    )
      .filter(([, metar]) => metar.current !== null)
      .map(([icao]) => icao),
)

export const selectIdvsAerodromes = createSelector(
  selectAerodromesWithPrefixes,
  selectAerodromesWithMetarFromPrefixes,
  (ads, icaos) =>
    Object.entries(ads)
      .filter(([icao, ad]) => ad.runways.length > 0 && icaos.includes(icao))
      .map(([icao]) => icao)
      .sort(),
)
