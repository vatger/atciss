import { createSelector } from "@reduxjs/toolkit"
import { api } from "services/api"
import { selectUser } from "../app/auth/slice"

export const usePollControllers: typeof api.useControllersQuery = (
  _,
  options,
) => api.useControllersQuery(_, { pollingInterval: 60000, ...options })

export const selectControllers = createSelector(
  api.endpoints.controllers.select(),
  (response) => response.data ?? [],
)

export const selectMe = createSelector(
  selectControllers,
  selectUser,
  (controllers, user) =>
    controllers.find((c) => c.cid.toString() === user?.sub),
)
