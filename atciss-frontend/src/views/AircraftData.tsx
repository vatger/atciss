/** @jsxImportSource theme-ui */

import { Box, Flex, Grid, Spinner } from "theme-ui"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { aircraftApi } from "../services/aircraftApi"
import { selectQuery, setQuery } from "../services/aircraftSlice"
import { XmButton } from "../components/XmButton"
import { AircraftInfoBox } from "../components/AircraftInfoBox"
import { XmInput } from "../components/XmInput"
import { SidebarLayout } from "../components/SidebarLayout"

const airbusAC = {
  A319: "A319",
  A320: "A320",
  A20N: "A320 neo",
  A321: "A321",
  A21N: "A321 neo",
  A310: "A310",
  A333: "A330-300",
  A339: "A330 neo",
  A346: "A340-600",
  A359: "A350-900",
  A388: "A380",
}

const boeingAC = {
  B736: "737-600",
  B737: "737-700",
  B738: "737-800",
  B739: "737-900",
  B744: "747-4",
  B748: "747-800",
  B788: "787-800",
  B789: "787-900",
  B78X: "787-1000",
  B77W: "777-300ER",
}

const otherAC = {
  AT76: "ATR 72-600",
  B463: "BAe-146-300",
  CRJ7: "CRJ-700",
  CRJ9: "CRJ-900",
  E190: "E190",
  E195: "E195",
  MD11: "MD11",
  MD82: "MD82",
  DH8D: "Dash-8",
  CONC: "Concorde",
}

const gaAC = {
  C25C: "Citation",
  C700: "C700",
  CL60: "CL60",
  C172: "Cessna 172",
  TBM8: "TBM-850",
  SF50: "Vision SF50",
  DA62: "DA62",
  PC12: "Pilatus PC12",
}

const milAC = {
  EUFI: "Eurofighter",
  A400: "A400M",
  C160: "C160",
}

const quickLinks = {
  Airbus: airbusAC,
  Boeing: boeingAC,
  Airliner: otherAC,
  GA: gaAC,
  MIL: milAC,
}

export const AircraftData = () => {
  const dispatch = useAppDispatch()
  const query = useAppSelector(selectQuery)
  const {
    data: results,
    isLoading,
    isSuccess,
    isError,
    error,
  } = aircraftApi.useSearchQuery(query)

  let content

  if (isLoading) {
    content = <Spinner />
  } else if (isSuccess) {
    content = results.map((result) => (
      <AircraftInfoBox key={result.id} ac={result} />
    ))
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  return (
    <SidebarLayout>
      <Box sx={{ padding: 2, overflowX: "auto" }}>{content}</Box>
      <Flex
        sx={{
          flexDirection: "column",
          gap: 2,
          overflowX: "auto",
          padding: 2,
        }}
      >
        <XmInput
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
          sx={{ fontSize: "2rem", fontFamily: "monospace", fontWeight: "bold" }}
          placeholder={"Search"}
        ></XmInput>

        {Object.entries(quickLinks).map(([key, value]) => (
          <Box key={key} sx={{ marginTop: 3 }}>
            <Box
              sx={{
                backgroundColor: "primary",
                color: "background",
                padding: 1,
                textAlign: "center",
                marginBottom: 2,
              }}
            >
              {key}
            </Box>

            <Grid gap={2} columns={[3, "1fr 1fr 1fr"]}>
              {Object.entries(value).map(([key, value]) => (
                <XmButton
                  key={key}
                  sx={{ backgroundColor: "#001595", color: "white" }}
                  onClick={() => dispatch(setQuery(key))}
                >
                  {value}
                </XmButton>
              ))}
            </Grid>
          </Box>
        ))}
      </Flex>
    </SidebarLayout>
  )
}
