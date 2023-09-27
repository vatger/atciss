import { createApi } from "@reduxjs/toolkit/query/react"
import { fetchWithAuth } from "../app/auth"

type Event = {
  name: string
  date_start: string
  date_end: string
  fir: string
}

export const eventApi = createApi({
  reducerPath: "event",
  baseQuery: fetchWithAuth,
  endpoints: (builder) => ({
    getByFir: builder.query<Event[], string[]>({
      query: (firs) => ({
        url: `event/`,
        params: firs.map((fir) => ["fir", fir]),
      }),
    }),
  }),
})

export const usePollEventsByFirs: typeof eventApi.useGetByFirQuery = (
  firs,
  options,
) => eventApi.useGetByFirQuery(firs, { pollingInterval: 60000, ...options })
