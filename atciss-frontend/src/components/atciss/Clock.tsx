/** @jsxImportSource theme-ui */

import { useEffect, useState } from "react"
import { Box, Text, ThemeUIStyleObject } from "theme-ui"

const Clock = ({ ssx }: { ssx?: ThemeUIStyleObject }) => {
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
        cursor: "default",
        px: 2,
        color: "clockText",
        backgroundColor: "clockBackground",
        border: "inset 2px",
        borderTopColor: "darkshadow",
        borderLeftColor: "darkshadow",
        borderBottomColor: "brightshadow",
        borderRightColor: "brightshadow",
        ...ssx,
      }}
    >
      <Text variant="clock">
        <Text variant="clockHr">{hours}:</Text>
        <Text variant="clockMin">{mins}</Text>
        <Text variant="clockSec">
          <Text variant="clockMinSecSep">:</Text>
          {secs}
        </Text>
      </Text>
    </Box>
  )
}

export { Clock }
