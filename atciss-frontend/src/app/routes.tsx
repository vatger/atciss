import { createBrowserRouter } from "react-router-dom"
import { AtisAfw } from "../views/AtisAfw"
import { Map } from "../views/Map"
import { Wx } from "../views/Wx"
import { App } from "../App"
import { Notam } from "../views/Notam"
import {
  Auth,
  AuthCallback,
  Logout,
  RequireAuth,
  authCallbackLoader,
  authLoader,
} from "./auth"

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      {
        path: "/",
        element: <AtisAfw sx={{ flex: "auto" }} />,
      },
      {
        path: "map",
        element: <Map />,
      },
      {
        path: "wx",
        element: <Wx />,
      },
      {
        path: "notam",
        element: <Notam />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    loader: authLoader,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
    loader: authCallbackLoader,
  },
  {
    path: "/logout",
    element: <Logout />,
  },
])

export default router
