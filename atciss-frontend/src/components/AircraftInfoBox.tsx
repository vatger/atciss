import { Box, Flex, Heading } from "theme-ui"
import { AircraftInfoBit } from "./AircraftInfoBit"
import { AircraftPerformanceData } from "../services/aircraftApi"

const beautify_recat = (recat: string) =>
  ({
    F: "A|L",
    E: "E|M↓",
    D: "D|M↑",
    C: "C|H↓",
    B: "B|H↑",
    A: "A|SH",
  })[recat ?? ""] ?? "?"

export const AircraftInfoBox = ({ ac }: { ac: AircraftPerformanceData }) => {
  const formatter = Intl.NumberFormat(undefined, {
    maximumSignificantDigits: 3,
  })

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Heading>
        {ac.manufacturer} {ac.model}
      </Heading>
      <Flex sx={{ gap: 2 }}>
        {ac.icao_designator && (
          <AircraftInfoBit
            textColor="background"
            backgroundColor="primary"
            item="ICAO"
            value={ac.icao_designator || "?"}
            link={
              "https://contentzone.eurocontrol.int/aircraftperformance/details.aspx?ICAO=" +
              ac.icao_designator
            }
          />
        )}
        <AircraftInfoBit
          textColor="black"
          backgroundColor="#B0BEC5"
          item="ENG"
          value={ac.engine_count + " " + ac.engine_type}
        />
        {ac.max_speed_indicated && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#B0BEC5"
            item={
              <>
                V<sub>MO</sub>
              </>
            }
            value={formatter.format(ac.max_speed_indicated) + " kt"}
          />
        )}
        {ac.max_speed_mach && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#B0BEC5"
            item={
              <>
                M<sub>MO</sub>
              </>
            }
            value={"M" + formatter.format(ac.max_speed_mach)}
          />
        )}

        {ac.max_weight_takeoff && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#FFCC80"
            item="MTOW"
            value={formatter.format(ac.max_weight_takeoff / 1000) + " t"}
          />
        )}

        {ac.cat_wtc && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#FFCC80"
            item="WTC"
            value={ac.cat_wtc}
          />
        )}

        {ac.cat_recat && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#FFCC80"
            item="RECAT"
            value={beautify_recat(ac.cat_recat)}
          />
        )}

        {ac.wingspan && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#9FA8DA"
            item="WINGSPAN"
            value={formatter.format(ac.wingspan) + " m"}
          />
        )}
        {ac.cat_arc && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#9FA8DA"
            item="ARC"
            value={ac.cat_arc}
          />
        )}

        {ac.v_at && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#80CBC4"
            item={
              <>
                V<sub>AT</sub>
              </>
            }
            value={formatter.format(ac.v_at) + " kt"}
          />
        )}
        {ac.cat_app && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#80CBC4"
            item="ASC"
            value={ac.cat_app}
          />
        )}

        {ac.length && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#EEE"
            item="Length"
            value={formatter.format(ac.length) + " m"}
          />
        )}

        {ac.height && (
          <AircraftInfoBit
            textColor="black"
            backgroundColor="#EEE"
            item="Height"
            value={formatter.format(ac.height) + " m"}
          />
        )}
      </Flex>
    </Box>
  )
}
