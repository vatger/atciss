import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query"
import { theme } from "app/atciss/theme"
import { Footer } from "components/atciss/Footer"
import { useEffect } from "react"
import { redirect, useLoaderData, useLocation, useNavigate } from "react-router"
import { Button, Flex, ThemeUIProvider } from "theme-ui"
import {
  LOCAL_STORAGE_REFRESH_KEY,
  LOCAL_STORAGE_ACCESS_KEY,
  login,
  logout,
  selectUser,
  AuthResponse,
} from "./auth/slice"
import { useAppDispatch, useAppSelector } from "./hooks"
import { Mutex } from "async-mutex"

export const RequireAuth = ({ children }: { children?: JSX.Element }) => {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      navigate("/auth", { state: { from: location } })
    }
  }, [user, navigate, location])

  return children || <></>
}

export const RequireAdmin = ({ children }: { children?: JSX.Element }) => {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.admin) {
      navigate("/")
    }
  }, [user, navigate])

  return children || <></>
}

export const Auth = () => {
  const redirect = async () => {
    const response = await fetch(`/api/auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const text = await response.text()
    const data = text.length ? JSON.parse(text) : null

    if (data !== null) {
      window.location.replace(
        `${data.auth_url}/oauth/authorize?client_id=${data.client_id}&redirect_uri=${window.location.protocol}//${window.location.host}%2Fauth%2Fcallback&response_type=code&scope=${data.scopes}`,
      )
    }
  }

  return (
    <ThemeUIProvider theme={theme}>
      <Flex sx={{ height: "100vh", flexDirection: "column" }}>
        <Flex sx={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Button onClick={redirect}>Log in with VATSIM</Button>
        </Flex>
        <Footer />
      </Flex>
    </ThemeUIProvider>
  )
}

const fetchWithAuth = fetchBaseQuery({
  baseUrl: "/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY)

    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
  responseHandler: async (response) => {
    const text = await response.text()
    return text.length ? JSON.parse(text) : null
  },
})

const refreshMutex = new Mutex()
export const fetchWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshMutex.waitForUnlock()
  let result = await fetchWithAuth(args, api, extraOptions)
  if (result.error && result.error.status === 401) {
    if (!refreshMutex.isLocked()) {
      const release = await refreshMutex.acquire()
      try {
        if (await refreshTokens()) {
          result = await fetchWithAuth(args, api, extraOptions)
        } else {
          location.replace("/auth")
        }
      } finally {
        release()
      }
    } else {
      await refreshMutex.waitForUnlock()
      result = await fetchWithAuth(args, api, extraOptions)
    }
  }
  return result
}

export const refreshTokens = async () => {
  const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_KEY)
  const response = await fetch(`/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  })
  const text = await response.text()
  const data = text.length ? JSON.parse(text) : null

  if (response.status !== 401 && data !== null) {
    localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, data.access)
    localStorage.setItem(LOCAL_STORAGE_REFRESH_KEY, data.refresh)
    return true
  }
  return false
}

export const authCallbackLoader = async () => {
  const query = new URL(window.location.href).searchParams
  const code = query.get("code")

  const response = await fetch(`/api/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  })

  if (response.status >= 400) {
    return redirect("/auth")
  }

  return response
}

export const AuthCallback = () => {
  const data = useLoaderData() as AuthResponse
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (user) {
      navigate("/")
    } else {
      dispatch(login(data))
    }
  }, [dispatch, navigate, user, data])

  return <>{JSON.stringify(user)}</>
}

export const Logout = () => {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) dispatch(logout())
    navigate("/auth")
  }, [dispatch, user])

  return (
    <ThemeUIProvider theme={theme}>
      <h1>{user ? "Logging out" : "Logged out"}</h1>
    </ThemeUIProvider>
  )
}
