import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"
import { usePollNotamByIcaoCodes } from "../services/notamApi"
import { DateTime } from "luxon"

const Notam = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const { data: notams } = usePollNotamByIcaoCodes([
    "EDDM",
    "EDMA",
    "EDMO",
    "EDMX",
    "EDPR",
    "EDME",
    "EDMS",
    "EDJA",
    "EDNY",
    "ETHL",
    "ETSI",
    "ETSL",
    "ETSN",
    "EDMM",
  ])

  // TODO:
  // show other locations for locations > 1?
  // est end time, not passed from API

  return (
    <Flex sx={{ ...sx, flexDirection: "column" }}>
      {notams &&
        Object.entries(notams).map(([icao, notams]) => {
          return (
            <details>
              <summary>{icao}</summary>
              {notams
                .filter((n) => DateTime.utc() <= n.valid_till)
                .map((n) => {
                  const active = DateTime.utc() >= n.valid_from

                  return (
                    <Box sx={{ padding: 2, fontFamily: "monospace" }}>
                      <Box>
                        <Text
                          variant="label"
                          sx={{ color: active ? "green" : "blue" }}
                        >
                          {active ? "Active, expires" : "Will be active"}{" "}
                          {(active ? n.valid_till : n.valid_from).toRelative()}
                        </Text>
                      </Box>
                      <Text variant="label">
                        {n.notam_id} NOTAM{n.notam_type[0]} {n.ref_notam_id}
                      </Text>
                      <Flex sx={{ gap: 5 }}>
                        {n.notam_code}
                        <Box>
                          <Text variant="label">FIR</Text> {n.fir}
                        </Box>
                        <Box>
                          <Text variant="label">Traffic</Text>{" "}
                          {n.traffic_type.join(", ")}
                        </Box>
                        <Box>
                          <Text variant="label">Purpose</Text>{" "}
                          {n.purpose.join(", ")}
                        </Box>
                      </Flex>
                      <Flex sx={{ gap: 5 }}>
                        <Box>
                          <Text variant="label">Scope</Text>{" "}
                          {n.scope.join(", ")}
                        </Box>
                        <Box>
                          <Text variant="label">FL Lower</Text> {n.fl_lower}
                        </Box>
                        <Box>
                          <Text variant="label">FL Upper</Text> {n.fl_upper}
                        </Box>
                        <Box>
                          <Text variant="label">Area</Text> {n.area.lat}{" "}
                          {n.area.long} {n.area.radius}nm
                        </Box>
                      </Flex>
                      {n.schedule ? (
                        <Box>
                          <Text variant="label">Schedule</Text> {n.schedule}
                        </Box>
                      ) : (
                        <></>
                      )}
                      {n.limit_lower ? (
                        <Box>
                          <Text variant="label">Lower Limit</Text>{" "}
                          {n.limit_lower}
                        </Box>
                      ) : (
                        <></>
                      )}
                      {n.limit_upper ? (
                        <Box>
                          <Text variant="label">Upper Limit</Text>{" "}
                          {n.limit_upper}
                        </Box>
                      ) : (
                        <></>
                      )}
                      <Flex sx={{ gap: 5 }}>
                        <Box>
                          <Text variant="label">Created</Text>{" "}
                          {n.created ? n.created.toFormat("y-MM-dd HH:mm") : ""}
                        </Box>
                        <Box>
                          <Text variant="label">Source</Text> {n.source}
                        </Box>
                      </Flex>
                      <pre>{n.body}</pre>
                    </Box>
                  )
                })}
            </details>
          )
        })}
    </Flex>
  )
}

export { Notam }
