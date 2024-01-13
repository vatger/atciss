import { api } from "services/api"

export const usePollEventsByFirs: typeof api.useEventsByFirQuery = (
  firs,
  options,
) => api.useEventsByFirQuery(firs, { pollingInterval: 60000, ...options })
