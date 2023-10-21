import { Flex, Link, Text, ThemeUIStyleObject } from "theme-ui"

const Footer = ({ sx }: { sx?: ThemeUIStyleObject }) => (
  <Flex
    sx={{
      ...sx,
      backgroundColor: "primary",
      p: ".5em",
      justifyContent: "space-between",
    }}
  >
    <Text sx={{ color: "white" }}>ATCISS</Text>
    <Link
      sx={{ color: "white" }}
      target="_blank"
      href="https://github.com/a3li/atciss"
    >
      GitHub
    </Link>
  </Flex>
)

export { Footer }
