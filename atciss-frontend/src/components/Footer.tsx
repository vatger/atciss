import { Flex, Text, ThemeUIStyleObject } from "theme-ui"

const Footer = ({ sx }: { sx?: ThemeUIStyleObject }) => (
  <Flex sx={{ ...sx, backgroundColor: "primary", p: ".5em" }}>
    <Text>ATCISS</Text>
  </Flex>
)

export { Footer }
