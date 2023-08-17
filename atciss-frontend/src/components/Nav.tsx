import { Flex, Grid, Text } from "theme-ui"
import { Clock } from "./Clock"

const Nav = () => (
  <Flex sx={{ backgroundColor: "primary" }}>
    <Text>
      <Clock />
    </Text>
    <Grid>nav buttons</Grid>
  </Flex>
)

export { Nav }
