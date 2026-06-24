import { render } from "vitest-browser-react"

const RESET_STORE = "e2e/resetStore"
let storeResetInstalled = false

export const fakeJwt = (claims: Record<string, unknown>) => {
  const base64url = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  return `${base64url({ alg: "none", typ: "JWT" })}.${base64url(claims)}.sig`
}

// The auth slice reads localStorage once, at module-evaluation time, so
// this must run before `app/store` (or anything importing it) loads.
export const setupAuthToken = (claimOverrides?: Record<string, unknown>) => {
  window.localStorage.clear()
  const token = fakeJwt({
    sub: "1",
    exp: Math.floor(Date.now() / 1000) + 3600,
    admin: false,
    fir_admin: [],
    ...claimOverrides,
  })
  window.localStorage.setItem("atciss_access", token)
  window.localStorage.setItem("atciss_refresh", token)
}

// This exercises the frontend only; stub the backend so it doesn't depend
// on a real instance running (and so a stray 401 can't trigger
// fetchWithReauth's redirect to /auth, which would unmount the map).
// RTK Query's fetchBaseQuery runs through the global fetch, so patching it
// here is the in-browser equivalent of Playwright's page.route stubbing.
export const stubApiEndpoints = (
  stubBodies: Record<string, string>,
  extraArrayEndpoints: string[] = [],
) => {
  const arrayEndpoints = [
    "areas",
    "navaid",
    "vatsim/controllers",
    ...extraArrayEndpoints,
  ]
  const realFetch = window.fetch.bind(window)
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    if (!url.includes("/api/")) return realFetch(input, init)
    const isArray = arrayEndpoints.some((endpoint) => url.includes(endpoint))
    const stubKey = Object.keys(stubBodies).find((key) => url.includes(key))
    const body = stubKey ? stubBodies[stubKey] : isArray ? "[]" : "{}"
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  }) as typeof window.fetch
  return () => {
    window.fetch = realFetch
  }
}

export const renderMapWithProviders = async (initialPath = "/map") => {
  const { Provider } = await import("react-redux")
  const { MemoryRouter } = await import("react-router")
  const { ThemeUIProvider } = await import("theme-ui")
  const { store, appReducer } = await import("app/store")
  const { theme } = await import("app/atciss/theme")
  const { Map } = await import("views/atciss/Map")
  const { api } = await import("services/api")
  const { windApi } = await import("services/windApi")

  if (!storeResetInstalled) {
    type AppState = ReturnType<typeof appReducer>
    store.replaceReducer((state: AppState | undefined, action) =>
      appReducer(
        // Reset every key except `map` to its own default by leaving it
        // undefined; combineReducers fills each undefined key in with its
        // slice's initialState. Resetting map causes issues in leaflet-velocity.
        action.type === RESET_STORE ? { ...state, map: state?.map } : state,
        action,
      ),
    )
    storeResetInstalled = true
  }
  const { setWind, setWindLevel } = await import("services/mapSlice")
  store.dispatch({ type: RESET_STORE })
  store.dispatch(api.util.resetApiState())
  store.dispatch(windApi.util.resetApiState())
  store.dispatch(setWind(false))
  store.dispatch(setWindLevel("surface"))

  return render(
    <Provider store={store}>
      <ThemeUIProvider theme={theme}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Map />
        </MemoryRouter>
      </ThemeUIProvider>
    </Provider>,
  )
}
