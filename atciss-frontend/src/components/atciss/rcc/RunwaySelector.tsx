/** @jsxImportSource theme-ui */

import { Button, Grid } from "theme-ui"

const headingOf = (designator: string) => parseInt(designator.slice(0, 2), 10)

export const orderRunways = (runwayGroups: string[][]) => {
  const paired = runwayGroups.filter((group) => group.length === 2)
  const singles = runwayGroups
    .filter((group) => group.length !== 2)
    .flat()
    .sort((a, b) => headingOf(b) - headingOf(a))

  const sortedPairs = paired.map(
    (group) =>
      [...group].sort((a, b) => headingOf(b) - headingOf(a)) as [
        string,
        string,
      ],
  )

  const clusters = new Map<string, [string, string][]>()
  for (const pair of sortedPairs) {
    const key = `${headingOf(pair[0])}/${headingOf(pair[1])}`
    const cluster = clusters.get(key) ?? []
    cluster.push(pair)
    clusters.set(key, cluster)
  }

  const orderedClusters = [...clusters.values()].sort(
    (a, b) => headingOf(b[0][0]) - headingOf(a[0][0]),
  )

  const pairedOrder = orderedClusters.flatMap((cluster) => [
    ...cluster.map(([higher]) => higher),
    ...cluster.map(([, lower]) => lower),
  ])

  return [...pairedOrder, ...singles]
}

export const RunwaySelector = ({
  runwayGroups,
  selected,
  onToggle,
}: {
  runwayGroups: string[][]
  selected: string[]
  onToggle: (designator: string, siblings: string[]) => void
}) => {
  const siblingsOf = new Map<string, string[]>()
  for (const group of runwayGroups) {
    for (const designator of group) {
      siblingsOf.set(
        designator,
        group.filter((d) => d !== designator),
      )
    }
  }

  return (
    <Grid
      sx={{
        gridTemplateColumns: "repeat(auto-fill, minmax(5rem, 1fr))",
        gap: 2,
      }}
    >
      {orderRunways(runwayGroups).map((designator) => (
        <Button
          key={designator}
          variant={
            selected.includes(designator)
              ? "selectedSecondaryNav"
              : "secondaryNav"
          }
          onClick={() => onToggle(designator, siblingsOf.get(designator) ?? [])}
        >
          RWY {designator}
        </Button>
      ))}
    </Grid>
  )
}
