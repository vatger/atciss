import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { RootState } from "../app/store"
import { createSelector } from "@reduxjs/toolkit"
import { selectActiveFir } from "./configSlice"

export interface Agreements {
  fir: string
  text: string
  changed_by_cid: string
  updated_at: string
}

export const agreementsApi = createApi({
  reducerPath: "agreements",
  baseQuery: fetchWithAuth,
  tagTypes: ["agreements"],
  endpoints: (builder) => ({
    getByFir: builder.query<Agreements, string>({
      query: (fir) => ({
        url: `agreements/${fir}`,
      }),
      providesTags: (result, _, arg) =>
        result
          ? ["agreements", { type: "agreements", id: arg }]
          : ["agreements"],
    }),
    edit: builder.mutation<Agreements, { fir: string; agreements: string }>({
      query: ({ fir, agreements }) => ({
        url: `agreements/${fir}`,
        body: agreements,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, arg) => [{ type: "agreements", id: arg.fir }],
    }),
  }),
})

export const usePollAgreements: typeof agreementsApi.useGetByFirQuery = (
  fir,
  options,
) => agreementsApi.useGetByFirQuery(fir, { pollingInterval: 5000, ...options })

export const selectAgreements = createSelector(
  (state: RootState) => state,
  selectActiveFir,
  (state, fir) =>
    agreementsApi.endpoints.getByFir.select(fir)(state)?.data?.text ?? "",
)
