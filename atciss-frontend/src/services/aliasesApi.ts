import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"
import { RootState } from "../app/store"
import { createSelector } from "@reduxjs/toolkit"
import { selectActiveFir } from "./configSlice"

export const aliasesApi = createApi({
  reducerPath: "aliases",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    get: builder.query<string, string>({
      query: (fir) => ({
        url: `aliases/${fir}`,
      }),
    }),
  }),
})

export const selectAliases = createSelector(
  (state: RootState) => state,
  selectActiveFir,
  (state, fir) => aliasesApi.endpoints.get.select(fir)(state)?.data ?? [],
)
