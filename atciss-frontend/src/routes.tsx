import { createBrowserRouter } from "react-router-dom"
import { AtisAfw } from "./views/AtisAfw"
import { Map } from "./views/Map"
import { Wx } from "./views/Wx"
import { App } from "./App"
import { Notam } from "./views/Notam"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <AtisAfw sx={{ flexGrow: "1" }} />,
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
])

export default router
