import {
  Deposit,
  DraftRunwayCondition,
  DraftRunwayConditions,
  RunwayCondition,
  RunwayConditions,
} from "types/rcc"

type Section = "TDZ" | "MID" | "END"

function utcTimeRoundedToTen(): string {
  const now = new Date()

  const hour = now.getUTCHours().toString().padStart(2, "0")
  const minute = Math.floor(now.getUTCMinutes() / 10) * 10

  return `${hour}${minute.toString().padStart(2, "0")}`
}

function formatDeposit(input: Deposit): string {
  return input.replaceAll("_", " ").toUpperCase()
}

function isSectionComplete(
  section: DraftRunwayCondition | undefined | null,
): section is RunwayCondition {
  return (
    !!section &&
    section.conditionCode !== undefined &&
    section.conditionCode !== null &&
    section.deposit !== undefined &&
    section.deposit !== null &&
    section.coverage !== undefined &&
    section.coverage !== null
  )
}

function isComplete(
  cond: DraftRunwayConditions | undefined | null,
): cond is RunwayConditions {
  return (
    !!cond &&
    isSectionComplete(cond.tdz) &&
    isSectionComplete(cond.mid) &&
    isSectionComplete(cond.end)
  )
}

function sameCC(cond: RunwayConditions): boolean {
  return (
    cond.tdz.conditionCode === cond.mid.conditionCode &&
    cond.tdz.conditionCode === cond.end.conditionCode
  )
}

function sameDeposit(cond: RunwayConditions): boolean {
  return (
    cond.tdz.deposit === cond.mid.deposit &&
    cond.tdz.deposit === cond.end.deposit
  )
}

function sameCoverage(cond: RunwayConditions): boolean {
  return (
    cond.tdz.coverage === cond.mid.coverage &&
    cond.tdz.coverage === cond.end.coverage
  )
}

function getSections(cond: RunwayConditions): [Section, RunwayCondition][] {
  return [
    ["TDZ", cond.tdz],
    ["MID", cond.mid],
    ["END", cond.end],
  ]
}

function buildRwyccLine(cond: RunwayConditions): string {
  if (sameCC(cond)) {
    return `RWYCC ${cond.tdz.conditionCode}`
  }

  return `RWYCC ${getSections(cond)
    .map(([label, c]) => `${label} ${c.conditionCode}`)
    .join(" ")}`
}

function buildDepositLine(cond: RunwayConditions): string | null {
  const sections = getSections(cond)

  const allDry = sections.every(([, c]) => c.conditionCode === 6)
  if (allDry) return null

  if (sameDeposit(cond) && sameCoverage(cond)) {
    return `DEPOSIT TOTAL RWY ${formatDeposit(cond.tdz.deposit)} ${cond.tdz.coverage} PCT`
  }

  const wetSections = sections.filter(([, c]) => c.conditionCode !== 6)
  return `DEPOSIT ${wetSections
    .map(
      ([label, c]) => `${label} ${formatDeposit(c.deposit)} ${c.coverage} PCT`,
    )
    .join(" ")}`
}

export function generateRcc(
  input: Record<string, DraftRunwayConditions>,
): string | undefined {
  if (Object.keys(input).length === 0) return undefined

  const time = utcTimeRoundedToTen()
  const blocks: string[] = []

  for (const [runway, condition] of Object.entries(input)) {
    if (!isComplete(condition)) continue

    const parts = [
      `RWY COND RWY ${runway} AT TIME ${time}`,
      buildRwyccLine(condition),
    ]

    const depositLine = buildDepositLine(condition)
    if (depositLine) parts.push(depositLine)

    blocks.push(parts.join(" "))
  }

  if (blocks.length === 0) return undefined

  return blocks.join("\n")
}
