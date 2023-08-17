import { Box, Flex } from "theme-ui"
import { Nav } from "./components/Nav"
import { RouterProvider } from "react-router-dom"
import router from "./routes"
import { Footer } from "./components/Footer"

const App = () => (
  <Flex sx={{ flexDirection: "column", height: "100vh" }}>
    <Nav />
    <Flex sx={{ flexGrow: "1", padding: "1em" }}>
      <RouterProvider router={router} />
    </Flex>
    <Footer />
  </Flex>
)

export { App }
