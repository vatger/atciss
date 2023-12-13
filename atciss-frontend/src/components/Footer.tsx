import { Flex, Link, Text, ThemeUIStyleObject } from "theme-ui"

const Footer = ({ sx }: { sx?: ThemeUIStyleObject }) => (
  <Flex
    sx={{
      ...sx,
      backgroundColor: "primary",
      p: ".5em",
      justifyContent: "space-between",
      color: "background",
    }}
  >
    <Text sx={{ color: "background" }}>ATCISS</Text>
    <Link
      sx={{ color: "background" }}
      target="_blank"
      href="https://github.com/vatger/atciss"
    >
      GitHub
    </Link>
    <Text>
      <Link
        sx={{ color: "background" }}
        target="_blank"
        href="https://vatsim-germany.org/imprint"
      >
        Impressum
      </Link>{" "}
      &{" "}
      <Link
        sx={{ color: "background" }}
        target="_blank"
        href="https://vatsim-germany.org/gdpr"
      >
        Datenschutz
      </Link>
    </Text>
  </Flex>
)

export { Footer }
