/** @jsxImportSource theme-ui */

import { Button, Grid } from "theme-ui"

export const RunwaySelector = ({
  runwayGroups,
  selected,
  onToggle,
}: {
  runwayGroups: string[][]
  selected: string[]
  onToggle: (designator: string, siblings: string[]) => void
}) => (
  <Grid
    sx={{
      gridTemplateColumns: "repeat(auto-fill, minmax(5rem, 1fr))",
      gap: 2,
    }}
  >
    {runwayGroups.flatMap((group) =>
      group.map((designator) => (
        <Button
          key={designator}
          variant={
            selected.includes(designator)
              ? "selectedSecondaryNav"
              : "secondaryNav"
          }
          onClick={() =>
            onToggle(
              designator,
              group.filter((d) => d !== designator),
            )
          }
        >
          RWY {designator}
        </Button>
      )),
    )}
  </Grid>
)
