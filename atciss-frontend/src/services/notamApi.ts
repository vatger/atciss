import { createSelector } from "@reduxjs/toolkit"
import { DateTime } from "luxon"
import { api } from "services/api"
import { RootState } from "../app/store"
import { selectNotamDesignators } from "./configSlice"
import { selectInactiveFiltered, selectReadFiltered } from "./notamSlice"

export const usePollNotamByIcaoCodes: typeof api.useNotamsByIcaoCodesQuery = (
  icao,
  options,
) =>
  api.useNotamsByIcaoCodesQuery(icao, {
    pollingInterval: 3600000,
    ...options,
  })

const selectByDesignators = createSelector(
  selectNotamDesignators,
  api.endpoints.notamsByIcaoCodes.select,
)
const selectAllNotams = createSelector(
  (state: RootState) => state,
  selectByDesignators,
  (state, selector) => selector(state)?.data ?? {},
)

const selectReadNotamIds = createSelector(
  (state: RootState) => state,
  (state) => api.endpoints.notamsSeen.select()(state)?.data ?? [],
)

export const selectNotamIsRead = createSelector(
  selectReadNotamIds,
  (_state: RootState, icao: string) => icao,
  (readNotamIds, notamId) => readNotamIds.includes(notamId),
)

export const selectNotamsByDesignator = createSelector(
  selectAllNotams,
  selectInactiveFiltered,
  selectReadFiltered,
  selectReadNotamIds,
  (_state: RootState, icao: string) => icao,
  (notams, inactiveFiltered, readFiltered, readNotams, icao) => {
    const icaoNotams = (notams[icao ?? ""] ?? []).filter(
      (n) => DateTime.utc() <= DateTime.fromISO(n.valid_till).toUTC(),
    )

    return {
      notams: icaoNotams
        .filter((n) => !readFiltered || !readNotams.includes(n.notam_id))
        .filter(
          (n) =>
            !inactiveFiltered ||
            DateTime.fromISO(n.valid_from).toUTC() <= DateTime.utc(),
        ),
      total: icaoNotams.length,
    }
  },
)

export const selectActiveNotamsByDesignator = createSelector(
  selectNotamsByDesignator,
  (_state: RootState, icao: string) => icao,
  (notams) =>
    notams.notams
      .filter((n) => DateTime.utc() >= DateTime.fromISO(n.valid_from).toUTC())
      .sort((n1, n2) => n1.notam_code.localeCompare(n2.notam_code)),
)

export const selectInactiveNotamsByDesignator = createSelector(
  selectNotamsByDesignator,
  (_state: RootState, icao: string) => icao,
  (notams) =>
    notams.notams
      .filter((n) => DateTime.utc() < DateTime.fromISO(n.valid_from).toUTC())
      .sort((n1, n2) =>
        DateTime.fromISO(n1.valid_from).toUTC() <
        DateTime.fromISO(n2.valid_from).toUTC()
          ? -1
          : 1,
      ),
)

export const selectTotalNotamsByDesignator = createSelector(
  selectNotamsByDesignator,
  (_state: RootState, icao: string) => icao,
  (notams) => notams.total,
)
