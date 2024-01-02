import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
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
import { setupListeners } from "@reduxjs/toolkit/query"
import { atisAfwReducer } from "../services/atisAfwSlice"
import { sectorstatusApi } from "../services/sectorstatusApi"
import { agreementsApi } from "../services/agreementsApi"
import { notamReducer } from "../services/notamSlice"
import { airwayApi } from "../services/airwayApi"
import { aliasesApi } from "../services/aliasesApi"
import { sigmetApi } from "../services/sigmetApi"

export const store = configureStore({
  reducer: {
    [adApi.reducerPath]: adApi.reducer,
    [agreementsApi.reducerPath]: agreementsApi.reducer,
    [aircraftApi.reducerPath]: aircraftApi.reducer,
    [airwayApi.reducerPath]: airwayApi.reducer,
    [aliasesApi.reducerPath]: aliasesApi.reducer,
    [areaApi.reducerPath]: areaApi.reducer,
    [atisApi.reducerPath]: atisApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [controllerApi.reducerPath]: controllerApi.reducer,
    [ecfmpApi.reducerPath]: ecfmpApi.reducer,
    [eventApi.reducerPath]: eventApi.reducer,
    [loaApi.reducerPath]: loaApi.reducer,
    [metarApi.reducerPath]: metarApi.reducer,
    [navaidApi.reducerPath]: navaidApi.reducer,
    [notamApi.reducerPath]: notamApi.reducer,
    [sectorApi.reducerPath]: sectorApi.reducer,
    [sectorstatusApi.reducerPath]: sectorstatusApi.reducer,
    [sigmetApi.reducerPath]: sigmetApi.reducer,
    [tafApi.reducerPath]: tafApi.reducer,
    [trafficApi.reducerPath]: trafficApi.reducer,
    activePositions: activePositionReducer,
    aircraft: aircraftReducer,
    atisAfw: atisAfwReducer,
    auth: authReducer,
    config: configReducer,
    map: mapReducer,
    notamView: notamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(adApi.middleware)
      .concat(agreementsApi.middleware)
      .concat(aircraftApi.middleware)
      .concat(airwayApi.middleware)
      .concat(aliasesApi.middleware)
      .concat(areaApi.middleware)
      .concat(atisApi.middleware)
      .concat(bookingApi.middleware)
      .concat(controllerApi.middleware)
      .concat(ecfmpApi.middleware)
      .concat(eventApi.middleware)
      .concat(loaApi.middleware)
      .concat(metarApi.middleware)
      .concat(navaidApi.middleware)
      .concat(notamApi.middleware)
      .concat(sectorApi.middleware)
      .concat(sectorstatusApi.middleware)
      .concat(sigmetApi.middleware)
      .concat(tafApi.middleware)
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
