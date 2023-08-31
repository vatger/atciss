import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/dist/query"
import { metarApi } from "../services/metarApi"
import { atisApi } from "../services/atisApi"
import { notamApi } from "../services/notamApi"
import { adApi } from "../services/adApi"
import { authReducer } from "./auth/slice"
import { sectorApi } from "../services/airspaceApi"

export const store = configureStore({
  reducer: {
    [metarApi.reducerPath]: metarApi.reducer,
    [atisApi.reducerPath]: atisApi.reducer,
    [notamApi.reducerPath]: notamApi.reducer,
    [adApi.reducerPath]: adApi.reducer,
    [sectorApi.reducerPath]: sectorApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(metarApi.middleware)
      .concat(atisApi.middleware)
      .concat(adApi.middleware)
      .concat(notamApi.middleware)
      .concat(sectorApi.middleware),
})

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
