import { Flex } from "theme-ui"
import { Nav } from "./Nav"
import { AtisAfw } from "./AtisAfw"

const App = () => (
  <Flex sx={{ flexDirection: "column", height: "100vh" }}>
    <Nav />
    <AtisAfw sx={{ flexGrow: "1" }} />
    <Flex>FOOTER</Flex>
  </Flex>
)

export { App }
