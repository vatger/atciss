/** @jsxImportSource theme-ui */
import { selectUser } from "app/auth/slice"
import { useAppSelector } from "app/hooks"
import { Link } from "react-router"
import { Box, Flex, Text, ThemeUIStyleObject, useColorMode } from "theme-ui"

const Footer = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const user = useAppSelector(selectUser)
  const [colorMode, setColorMode] = useColorMode()

  return (
    <Box sx={{ pt: "1px", backgroundColor: "primary" }}>
      <Flex
        sx={{
          ...sx,
          backgroundColor: "primary",
          justifyContent: "space-between",
          color: "primaryText",
          borderTop: "2px solid",
          borderTopColor: "brightshadow",
        }}
      >
        <Box variant={"cards.footer"}>
          <Text sx={{ color: "primaryText" }}>
            ATCISS/IDVS
            <Link
              sx={{ color: "primaryText" }}
              target="_blank"
              to="https://github.com/vatger/atciss"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                height="14"
                width="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                sx={{ verticalAlign: "middle", ml: 2 }}
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </Link>
          </Text>
        </Box>
        <Box
          variant={"cards.footer"}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <a
            sx={{ color: "background" }}
            title="Switch between dark and light mode"
            onClick={() =>
              setColorMode(colorMode === "default" ? "dark" : "default")
            }
          >
            {colorMode === "default" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                sx={{ display: "block" }}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-sun"
                sx={{ display: "block" }}
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </a>
        </Box>
        <Box variant={"cards.footer"}>
          <strong>{user?.sub}</strong>{" "}
          {user && (
            <Link sx={{ color: "primaryText" }} to="logout">
              (Logout)
            </Link>
          )}
        </Box>
        <Box variant={"cards.footer"} sx={{ flexGrow: 9 }}></Box>
        <Box variant={"cards.footer"}>
          <Text>
            <Link
              sx={{ color: "primaryText" }}
              target="_blank"
              to="https://vatsim-germany.org/imprint"
            >
              Impressum
            </Link>{" "}
            &{" "}
            <Link
              sx={{ color: "primaryText" }}
              target="_blank"
              to="https://vatsim-germany.org/gdpr"
            >
              Datenschutz
            </Link>
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

export { Footer }
