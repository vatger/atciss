import { Flex } from "theme-ui"
import { Nav } from "./components/Nav"
import { Outlet } from "react-router-dom"
import { Footer } from "./components/Footer"

const App = () => (
  <Flex sx={{ flexDirection: "column", height: "100vh" }}>
    <Nav sx={{ flex: "none" }} />
    <Flex sx={{ flex: "auto", overflow: "auto" }}>
      <Outlet />
    </Flex>
    <Footer sx={{ flex: "none" }} />
  </Flex>
)

export { App }
