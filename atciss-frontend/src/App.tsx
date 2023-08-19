import { Flex } from "theme-ui"
import { Nav } from "./components/Nav"
import { Outlet } from "react-router-dom"
import { Footer } from "./components/Footer"

const App = () => (
  <Flex sx={{ flexDirection: "column", height: "100vh" }}>
    <Nav />
    <Flex sx={{ flexGrow: "1", padding: "1em" }}>
      <Outlet />
    </Flex>
    <Footer />
  </Flex>
)

export { App }
