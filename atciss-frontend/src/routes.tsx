import { createBrowserRouter } from "react-router-dom"
import { AtisAfw } from "./views/AtisAfw"
import { Map } from "./views/Map"

const router = createBrowserRouter([
  {
    path: "/",
    element: <AtisAfw sx={{ flexGrow: "1" }} />,
  },
  {
    path: "/map",
    element: <Map />,
  },
])

export default router
