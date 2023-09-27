import React, { useEffect } from "react"
import {
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { useAppDispatch, useAppSelector } from "./hooks"
import { LOCAL_STORAGE_JWT_KEY, login, logout, selectUser } from "./auth/slice"
import { fetchBaseQuery } from "@reduxjs/toolkit/dist/query"
import { Button, Flex } from "theme-ui"

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
        `${data.auth_url}/oauth/authorize?client_id=${data.client_id}&redirect_uri=${window.location.protocol}//${window.location.host}%2Fauth%2Fcallback&response_type=code&scope=full_name+email+vatsim_details+country`,
      )
    }
  }

  return (
    <Flex
      sx={{ justifyContent: "center", alignItems: "center", height: "100vh" }}
    >
      <Button onClick={redirect}>Log in with VATSIM Connect</Button>
    </Flex>
  )
}

export const fetchWithAuth = fetchBaseQuery({
  baseUrl: "/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(LOCAL_STORAGE_JWT_KEY)

    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    return headers
  },
  responseHandler: async (response) => {
    if (response.status === 401) {
      location.replace("/auth")
    }

    const text = await response.text()
    return text.length ? JSON.parse(text) : null
  },
})

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
  const data = useLoaderData() as { jwt: string }
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (user) {
      navigate("/")
    } else {
      dispatch(login(data.jwt))
    }
  }, [dispatch, navigate, user, data.jwt])

  return <>{JSON.stringify(user)}</>
}

export const Logout = () => {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (user) dispatch(logout())
  }, [dispatch, user])

  return <>{user ? "Logging out" : "Logged out"}</>
}
