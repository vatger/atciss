import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../app/store"
import { selectActiveFir } from "./configSlice"
import { api } from "services/api"

export interface Agreements {
  fir: string
  text: string
  changed_by_cid: string
  updated_at: string
}

export const usePollAgreements: typeof api.useAgreementsByFirQuery = (
  fir,
  options,
) =>
  api.useAgreementsByFirQuery(fir, {
    pollingInterval: 5000,
    ...options,
  })

const selectByFir = createSelector(
  selectActiveFir,
  api.endpoints.agreementsByFir.select,
)
export const selectAgreements = createSelector(
  (state: RootState) => state,
  selectByFir,
  (state, selector) => selector(state)?.data?.text ?? "",
)
