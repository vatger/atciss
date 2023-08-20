import { useEffect, useState } from "react"
import { Box, Text } from "theme-ui"

const Clock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  })

  const hours = String(time.getUTCHours()).padStart(2, "0")
  const mins = String(time.getUTCMinutes()).padStart(2, "0")
  const secs = String(time.getUTCSeconds()).padStart(2, "0")
  return (
    <Box
      sx={{
        fontFamily: "monospace",
        fontWeight: "bold",
        backgroundColor: "#565964",
        color: "#fff",
        px: ".4rem",
        py: ".2rem",
        border: "solid 2px",
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
        letterSpacing: ".15rem",
      }}
    >
      <Text sx={{ fontSize: "1.8rem" }}>
        {hours}:{mins}
      </Text>
      <Text sx={{ fontSize: "1.2rem" }}>{secs}</Text>
    </Box>
  )
}

export { Clock }
