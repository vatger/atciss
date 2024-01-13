import { api } from "services/api"

export const usePollGetTraffic: typeof api.useTrafficQuery = (icao, options) =>
  api.useTrafficQuery(icao, {
    pollingInterval: 60000,
    ...options,
  })
