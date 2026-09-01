export type Deposit =
  | "dry"
  | "wet"
  | "frost"
  | "slush"
  | "dry_snow"
  | "wet_snow"
  | "slippery_wet"
  | "ice"
  | "compacted_snow"
  | "standing_water"

export interface RunwayCondition {
  conditionCode: number
  deposit: Deposit
  coverage: number
}

export interface RunwayConditions {
  tdz: RunwayCondition
  mid: RunwayCondition
  end: RunwayCondition
}

export type RunwayZone = keyof RunwayConditions

export type DraftRunwayCondition = Partial<RunwayCondition>
export type DraftRunwayConditions = Partial<
  Record<RunwayZone, DraftRunwayCondition>
>

export type RccMode = "ez" | "ad"
