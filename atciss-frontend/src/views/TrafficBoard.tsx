/** @jsxImportSource theme-ui */
import { Box, Text } from "theme-ui"
import { usePollGetTraffic } from "../services/trafficApi"
import { useParams, useSearchParams } from "react-router-dom"
import { DateTime } from "luxon"

const formatETA = (datestring?: string) => {
  if (!datestring) {
    return "?"
  }

  const nowTime = DateTime.now().toUTC()
  const etaTime = DateTime.fromISO(datestring, { zone: "UTC" })
  if (etaTime < nowTime) {
    return "landing"
  }

  return etaTime.toFormat("HH:mm")
}

const BoardLetter = ({ letter }: { letter: string }) => (
  <Text sx={{ border: "2px solid #222", padding: "3px" }}>
    <span
      sx={{
        visibility: letter == " " ? "hidden" : "inherit",
        textShadow: "0 0 5px #bbb",
      }}
    >
      {letter.replace(" ", "_")}
    </span>
  </Text>
)

const BoardLine = ({ text }: { text: string }) => (
  <Box
    sx={{
      fontFamily: "Aeroport",
      color: "white",
      backgroundColor: "#2b30bf",
      borderTop: "2px solid #222",
      borderBottom: "2px solid #222",
    }}
  >
    {text
      .replaceAll("-", " ")
      .split("")
      .map((letter) => (
        <BoardLetter letter={letter} />
      ))}
  </Box>
)

const TrafficBoard = () => {
  const { icao, type } = useParams()
  const [searchParams] = useSearchParams()

  if (!icao) {
    return <h1>Missing Airport</h1>
  }
  if (!type) {
    return <h1>Set type: arr or dep</h1>
  }

  const { data: results, isLoading, isSuccess } = usePollGetTraffic("EDDM")

  const adWidthStr = searchParams.get("ad_width")
  let adWidth = 18
  if (adWidthStr) {
    adWidth = parseInt(adWidthStr)
  }

  let content

  if (isLoading) {
    content = <BoardLine text={"loading...".padEnd(100, " ")} />
  } else if (isSuccess) {
    if (type == "dep") {
      content = results.departures.map((departure) => (
        <BoardLine
          key={departure.callsign}
          text={`${departure.callsign.padEnd(8, " ")} ${
            departure.destination_icao
          } ${departure.destination
            .substring(0, adWidth)
            .padEnd(adWidth, " ")}  ${
            departure.groundspeed > 1 ? "taxi" : "wait"
          }`.padEnd(100, " ")}
        ></BoardLine>
      ))
    } else {
      content = results.arrivals.map((arrival) => (
        <BoardLine
          key={arrival.callsign}
          text={`${arrival.callsign.padEnd(8, " ")} ${
            arrival.departure_icao
          } ${arrival.departure
            .substring(0, adWidth)
            .padEnd(adWidth, " ")}  ${formatETA(arrival.eta)}`.padEnd(100, " ")}
        ></BoardLine>
      ))
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: "#222",
        width: "100vw",
        height: "100vh",
        padding: "2rem",
      }}
    >
      <img
        src={type == "dep" ? "/img/departures.svg" : "/img/arrivals.svg"}
        sx={{ width: "50rem", marginBottom: "2rem" }}
        alt={"Header"}
      />
      <Box sx={{ fontSize: "6rem" }}>{content}</Box>
    </Box>
  )
}

export { TrafficBoard }
