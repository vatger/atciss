import { Box, Flex, Text, ThemeUIStyleObject } from "theme-ui"
import { usePollNotamByIcaoCodes } from "../services/notamApi"
import { DateTime } from "luxon"
import { useAppSelector } from "../app/hooks"
import { selectActiveEbg } from "../services/configSlice"
import { EBG_SETTINGS } from "../app/config"

const Notam = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const activeEbg = useAppSelector(selectActiveEbg)

  const { data: notams } = usePollNotamByIcaoCodes([
    ...EBG_SETTINGS[activeEbg].majorAerodromes,
    EBG_SETTINGS[activeEbg].fir,
    ...EBG_SETTINGS[activeEbg].aerodromes,
    ...EBG_SETTINGS[activeEbg].minorAerodromes,
    ...EBG_SETTINGS[activeEbg].relevantAerodromes,
  ])

  // TODO:
  // show other locations for locations > 1?
  // est end time, not passed from API

  return (
    <Flex sx={{ ...sx, flexDirection: "column", padding: 2, gap: 2 }}>
      {notams &&
        Object.entries(notams).map(([icao, notams]) => {
          return (
            <details>
              <summary>{icao}</summary>
              {notams
                .filter(
                  (n) =>
                    DateTime.utc() <= DateTime.fromISO(n.valid_till).toUTC(),
                )
                .map((n) => {
                  const valid_till = DateTime.fromISO(n.valid_till).toUTC()
                  const valid_from = DateTime.fromISO(n.valid_from).toUTC()
                  const active = DateTime.utc() >= valid_from

                  return (
                    <Box sx={{ padding: 2, fontFamily: "monospace" }}>
                      <Box
                        title={`${valid_from.toFormat("y-MM-dd HH:mm")}-${
                          valid_till.year !== 9999
                            ? valid_till.toFormat("y-MM-dd HH:mm")
                            : "permanent"
                        }`}
                      >
                        <Text
                          variant="label"
                          sx={{ color: active ? "green" : "blue" }}
                        >
                          {active
                            ? `Active, ${
                                valid_till.year !== 9999
                                  ? `expires ${valid_till.toRelative()}`
                                  : "permanent"
                              }`
                            : `Will be active ${valid_from.toRelative()}`}
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
                          {n.created
                            ? DateTime.fromISO(n.created)
                                .toUTC()
                                .toFormat("y-MM-dd HH:mm")
                            : ""}
                        </Box>
                        <Box>
                          <Text variant="label">Source</Text> {n.source}
                        </Box>
                      </Flex>
                      <Box sx={{ my: 1 }}>
                        <pre>{n.body}</pre>
                      </Box>
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
