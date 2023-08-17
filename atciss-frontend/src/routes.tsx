import { createBrowserRouter } from "react-router-dom";
import {AtisAfw} from "./views/AtisAfw";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AtisAfw sx={{ flexGrow: "1" }} />,
  },
]);

export default router;