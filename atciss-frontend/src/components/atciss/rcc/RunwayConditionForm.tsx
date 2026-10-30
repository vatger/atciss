/** @jsxImportSource theme-ui */

import { XmSelect } from "components/atciss/XmSelect"
import { Box, Button, Grid, Text } from "theme-ui"
import {
  Deposit,
  DraftRunwayConditions,
  RunwayCondition,
  RunwayZone,
} from "types/rcc"

const easyOptions: { label: string; condition: RunwayCondition }[] = [
  {
    label: "Dry",
    condition: { conditionCode: 6, deposit: "dry", coverage: 100 },
  },
  {
    label: "Wet",
    condition: { conditionCode: 5, deposit: "wet", coverage: 100 },
  },
  {
    label: "Snow",
    condition: { conditionCode: 5, deposit: "dry_snow", coverage: 100 },
  },
  {
    label: "Slippery Wet",
    condition: { conditionCode: 3, deposit: "slippery_wet", coverage: 100 },
  },
]

const deposits: Deposit[] = [
  "wet",
  "frost",
  "slush",
  "dry_snow",
  "wet_snow",
  "slippery_wet",
  "ice",
  "compacted_snow",
  "standing_water",
]

const depositLabel = (deposit: Deposit) =>
  deposit.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())

const zones: { key: RunwayZone; label: string }[] = [
  { key: "tdz", label: "TDZ" },
  { key: "mid", label: "MID" },
  { key: "end", label: "END" },
]

const isZoneComplete = (zone: DraftRunwayConditions[RunwayZone] | undefined) =>
  !!zone &&
  zone.conditionCode !== undefined &&
  zone.deposit !== undefined &&
  zone.coverage !== undefined

export const RunwayConditionForm = ({
  runway,
  mode,
  condition,
  submitted,
  setCondition,
  setEasyCondition,
}: {
  runway: string
  mode: "ez" | "ad"
  condition: DraftRunwayConditions | undefined
  submitted: boolean
  setCondition: (
    runway: string,
    zone: RunwayZone,
    updates: Partial<RunwayCondition>,
  ) => void
  setEasyCondition: (runway: string, condition: RunwayCondition) => void
}) => {
  if (mode === "ez") {
    const active = condition?.tdz
    const incomplete = submitted && !active

    return (
      <Box>
        {incomplete && (
          <Text sx={{ color: "red", fontSize: 1, display: "block", mb: 2 }}>
            Please select a surface condition — this runway will be skipped from
            the report until then.
          </Text>
        )}
        <Grid
          sx={{
            gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
            gap: 2,
          }}
        >
          {easyOptions.map(({ label, condition: c }) => (
            <Button
              key={label}
              variant={
                active?.conditionCode === c.conditionCode &&
                active?.deposit === c.deposit
                  ? "selectedSecondaryNav"
                  : "secondaryNav"
              }
              onClick={() => setEasyCondition(runway, c)}
            >
              {label}
            </Button>
          ))}
        </Grid>
      </Box>
    )
  }

  const incompleteZones = zones.filter(
    (z) => !isZoneComplete(condition?.[z.key]),
  )
  const showWarning = submitted && incompleteZones.length > 0

  return (
    <Box>
      {showWarning && (
        <Text sx={{ color: "red", fontSize: 1, display: "block", mb: 2 }}>
          Please complete {incompleteZones.map((z) => z.label).join(", ")} —
          this runway will be skipped from the report until then.
        </Text>
      )}
      <Grid sx={{ gridTemplateColumns: ["1fr", "1fr 1fr 1fr"], gap: 3 }}>
        {zones.map((zone) => {
          const zoneValue = condition?.[zone.key]
          const zoneWarning = submitted && !isZoneComplete(zoneValue)
          const hideDepositCoverage = zoneValue?.conditionCode === 6

          return (
            <Box key={zone.key}>
              <Text
                variant="label"
                sx={{ display: "block", textAlign: "center", mb: 1 }}
              >
                {zone.label}
                {zoneWarning ? " ⚠" : ""}
              </Text>

              <Text variant="label" sx={{ fontSize: 0 }}>
                Runway condition code
              </Text>
              <XmSelect
                sx={{ width: "100%", mb: 2 }}
                value={zoneValue?.conditionCode ?? ""}
                onChange={(e) =>
                  setCondition(runway, zone.key, {
                    conditionCode: Number(e.target.value),
                  })
                }
              >
                <option value="" disabled>
                  Select RWYCC
                </option>
                {[6, 5, 4, 3, 2, 1, 0].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </XmSelect>

              {!hideDepositCoverage && (
                <>
                  <Text variant="label" sx={{ fontSize: 0 }}>
                    Deposit
                  </Text>
                  <XmSelect
                    sx={{ width: "100%", mb: 2 }}
                    value={zoneValue?.deposit ?? ""}
                    onChange={(e) =>
                      setCondition(runway, zone.key, {
                        deposit: e.target.value as Deposit,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select deposit
                    </option>
                    {deposits.map((deposit) => (
                      <option key={deposit} value={deposit}>
                        {depositLabel(deposit)}
                      </option>
                    ))}
                  </XmSelect>

                  <Text variant="label" sx={{ fontSize: 0 }}>
                    Coverage
                  </Text>
                  <XmSelect
                    sx={{ width: "100%" }}
                    value={zoneValue?.coverage ?? ""}
                    onChange={(e) =>
                      setCondition(runway, zone.key, {
                        coverage: Number(e.target.value),
                      })
                    }
                  >
                    <option value="" disabled>
                      Select coverage
                    </option>
                    {[100, 75, 50, 25].map((coverage) => (
                      <option key={coverage} value={coverage}>
                        {coverage}%
                      </option>
                    ))}
                  </XmSelect>
                </>
              )}
            </Box>
          )
        })}
      </Grid>
    </Box>
  )
}
