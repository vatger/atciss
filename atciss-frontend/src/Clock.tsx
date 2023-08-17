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
        backgroundColor: "#999",
        color: "#fff",
        p: ".2em",
        m: ".2em",
        border: "2px inset #fff",
      }}
    >
      <Text sx={{ fontSize: "xx-large" }}>
        {hours}:{mins}
      </Text>
      <Text>{secs}</Text>
    </Box>
  )
}

export { Clock }
