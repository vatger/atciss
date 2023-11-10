import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/dist/query"
import { metarApi } from "../services/metarApi"
import { atisApi } from "../services/atisApi"
import { notamApi } from "../services/notamApi"
import { adApi } from "../services/adApi"
import { authReducer } from "./auth/slice"
import { sectorApi } from "../services/sectorApi"
import { activePositionReducer } from "../services/activePositionSlice"
import { configReducer } from "../services/configSlice"
import { controllerApi } from "../services/controllerApi"
import { mapReducer } from "../services/mapSlice"
import { aircraftReducer } from "../services/aircraftSlice"
import { loaApi } from "../services/loaApi"
import { tafApi } from "../services/tafApi"
import { ecfmpApi } from "../services/ecfmpApi"
import { eventApi } from "../services/eventApi"
import { areaApi } from "../services/areaApi"
import { bookingApi } from "../services/bookingApi"
import { navaidApi } from "../services/navaidApi"
import { aircraftApi } from "../services/aircraftApi"
import { trafficApi } from "../services/trafficApi"

export const store = configureStore({
  reducer: {
    [metarApi.reducerPath]: metarApi.reducer,
    [atisApi.reducerPath]: atisApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [notamApi.reducerPath]: notamApi.reducer,
    [adApi.reducerPath]: adApi.reducer,
    [sectorApi.reducerPath]: sectorApi.reducer,
    [controllerApi.reducerPath]: controllerApi.reducer,
    [loaApi.reducerPath]: loaApi.reducer,
    [tafApi.reducerPath]: tafApi.reducer,
    [ecfmpApi.reducerPath]: ecfmpApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [areaApi.reducerPath]: areaApi.reducer,
    [navaidApi.reducerPath]: navaidApi.reducer,
    [aircraftApi.reducerPath]: aircraftApi.reducer,
    [trafficApi.reducerPath]: trafficApi.reducer,
    auth: authReducer,
    activePositions: activePositionReducer,
    config: configReducer,
    map: mapReducer,
    aircraft: aircraftReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(metarApi.middleware)
      .concat(atisApi.middleware)
      .concat(bookingApi.middleware)
      .concat(adApi.middleware)
      .concat(notamApi.middleware)
      .concat(sectorApi.middleware)
      .concat(loaApi.middleware)
      .concat(tafApi.middleware)
      .concat(controllerApi.middleware)
      .concat(ecfmpApi.middleware)
      .concat(areaApi.middleware)
      .concat(eventApi.middleware)
      .concat(navaidApi.middleware)
      .concat(aircraftApi.middleware)
      .concat(trafficApi.middleware),
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
