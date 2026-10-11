/** @jsxImportSource theme-ui */
import { useAppSelector } from "app/hooks"
import { selectFirMajorAerodromes } from "services/configSlice"
import { api } from "services/api"
import { EXCLUDED_RUNWAYS } from "app/rcc/config"
import { useRccState } from "app/rcc/useRccState"
import { useMemo } from "react"
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  Grid,
  ThemeUIStyleObject,
} from "theme-ui"
import { AirportSelector } from "components/atciss/rcc/AirportSelector"
import { RunwaySelector } from "components/atciss/rcc/RunwaySelector"
import { RunwayConditionForm } from "components/atciss/rcc/RunwayConditionForm"
import { RccPreview } from "components/atciss/rcc/RccPreview"

const Rcc = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const majorAerodromes = useAppSelector(selectFirMajorAerodromes)
  const { data: aerodromes = {} } =
    api.useAerodromesByIcaosQuery(majorAerodromes)

  const rcc = useRccState()

  const runwayGroups = useMemo(() => {
    if (!rcc.icao) return []

    const excluded = EXCLUDED_RUNWAYS[rcc.icao] ?? []

    return (aerodromes[rcc.icao]?.runways ?? [])
      .map((rw) =>
        rw.directions
          .map((d) => d.designator)
          .filter((designator) => !excluded.includes(designator)),
      )
      .filter((group) => group.length > 0)
  }, [aerodromes, rcc.icao])

  const icaos = [...majorAerodromes].sort()

  const faq = [
    {
      title: "What is the difference between easy and advanced mode?",
      text: "In the advanced mode, you can put in your own values for the condition code, deposit and contamination. But be careful: the advanced mode should only be used if the input data is correct and realistic.",
    },
    {
      title: "How to decide the runway condition in the easy mode?",
      text: (
        <>
          <Text>
            Use the latest METARs to determine the precipitation. You can also
            check the real-world D-ATIS but this data might be outdated. Select
            the surface condition as follows:
          </Text>
          <Box as="ul" sx={{ fontSize: 1, fontWeight: "bold", my: 1 }}>
            <li>DRY = RWYCC 6 = No precipitation</li>
            <li>WET = RWYCC 5 = RA, DZ or BR</li>
            <li>SNOW = RWYCC 5 = SN, SG</li>
            <li>Slippery Wet = RWYCC 3 = PL, GR, GS</li>
          </Box>
          <Text sx={{ display: "block", fontSize: 1 }}>
            For RWYCCs worse than 3, use the advanced mode. In general, on the
            runway will only lead to RWYCC 5. Worse is possible, but unlikely.
          </Text>
        </>
      ),
    },
    {
      title: "How to put the RWYCC in my atis?",
      text: (
        <Image
          src="/img/rcc-vatis-example.png"
          alt="vatis explanation"
          sx={{
            mt: 2,
            maxWidth: "100%",
            width: "28rem",
            border: 1,
            borderColor: "brightshadow",
          }}
        />
      ),
    },
    {
      title: "Stil unsure? Use the decision making helpsheet.",
      text: (
        <Image
          src="/img/rcc-decision-making-helpsheet.png"
          alt="Decision making helpsheet"
          sx={{ mt: 2, maxWidth: "100%" }}
        />
      ),
    },
  ]

  return (
    <Flex
      sx={{
        ...sx,
        flexDirection: "column",
        gap: 3,
        p: 3,
        maxWidth: "60rem",
        mx: "auto",
        width: "100%",
      }}
    >
      <Box>
        <Text variant="atisL" as="h1" sx={{ m: 0 }}>
          RCC Generator
        </Text>
        <Text sx={{ fontSize: 1 }}>
          Generate ICAO runway condition reports (RWYCC) for the ATIS.
        </Text>
      </Box>

      <Box as="details" sx={{ ...cardSx, px: 3, py: 2 }}>
        <Box as="summary" sx={{ cursor: "pointer", fontWeight: "bold" }}>
          FAQ
        </Box>
        <Box sx={{ mt: 2, "> details": faqItemSx }}>
          {faq.map((faq) => (
            <Box as="details" key={faq.title}>
              <Box as="summary" sx={{ cursor: "pointer", fontSize: 1 }}>
                {faq.title}
              </Box>
              <Text
                sx={{
                  display: "block",
                  fontSize: 1,
                  mt: 1,
                  ml: 1,
                  pl: 3,
                  borderLeft: "solid 1px",
                }}
              >
                {faq.text}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={cardSx}>
        <AirportSelector
          icaos={icaos}
          aerodromes={aerodromes}
          value={rcc.icao}
          onChange={rcc.selectAirport}
        />
      </Box>

      {rcc.icao && (
        <Box sx={cardSx}>
          <Text variant="label" sx={{ display: "block", mb: 2 }}>
            Active runways
          </Text>
          {runwayGroups.length > 0 ? (
            <RunwaySelector
              runwayGroups={runwayGroups}
              selected={rcc.selectedRunways}
              onToggle={rcc.toggleRunway}
            />
          ) : (
            <Text sx={{ fontSize: 1, color: "darkshadow" }}>
              No runway data available for this aerodrome.
            </Text>
          )}
        </Box>
      )}

      {rcc.selectedRunways.length > 0 && (
        <Box sx={cardSx}>
          <Flex
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Text variant="label">Runway condition</Text>
            <Button
              variant="secondaryNav"
              onClick={() => rcc.setMode(rcc.mode === "ez" ? "ad" : "ez")}
            >
              {rcc.mode === "ez" ? "Easy mode" : "Advanced mode"} ⇄
            </Button>
          </Flex>

          <Grid sx={{ gap: 3 }}>
            {rcc.selectedRunways.map((runway) => (
              <Box
                key={runway}
                sx={{ borderTop: 1, borderColor: "brightshadow", pt: 2 }}
              >
                <Text sx={{ fontWeight: "bold", display: "block", mb: 1 }}>
                  RWY {runway}
                </Text>
                <RunwayConditionForm
                  runway={runway}
                  mode={rcc.mode}
                  condition={rcc.conditions[runway]}
                  submitted={rcc.submitted}
                  setCondition={rcc.setCondition}
                  setEasyCondition={rcc.setEasyCondition}
                />
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      <Button
        variant="primary"
        disabled={rcc.selectedRunways.length === 0}
        onClick={rcc.generate}
        sx={{ alignSelf: "start" }}
      >
        {rcc.conditionString === null && !rcc.submitted
          ? "Generate RCC"
          : "Regenerate RCC"}
      </Button>

      <Box sx={cardSx}>
        <Text variant="label" sx={{ display: "block", mb: 2 }}>
          Result
        </Text>
        <RccPreview code={rcc.conditionString} />
      </Box>
    </Flex>
  )
}

const faqItemSx: ThemeUIStyleObject = {
  borderTop: 1,
  borderColor: "brightshadow",
  pt: 2,
  mt: 2,
  "&:first-of-type": { borderTop: "none", pt: 0, mt: 0 },
}

const cardSx: ThemeUIStyleObject = {
  border: 2,
  borderStyle: "solid",
  borderTopColor: "brightshadow",
  borderLeftColor: "brightshadow",
  borderBottomColor: "darkshadow",
  borderRightColor: "darkshadow",
  backgroundColor: "background",
  p: 3,
}

export { Rcc }
