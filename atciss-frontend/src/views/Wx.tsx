import { Flex, ThemeUIStyleObject } from "theme-ui"

const Wx = ({ sx }: { sx?: ThemeUIStyleObject }) => (
  <Flex
    sx={{
      ...sx,
    }}
  >
    <iframe src={"https://aip.dfs.de/BasicIFR/pages/P00AAA.html"}></iframe>
  </Flex>
)

export { Wx }
