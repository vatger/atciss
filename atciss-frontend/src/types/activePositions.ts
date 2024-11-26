export type PositionStatus = Record<string, boolean>

export interface ActivePositionState {
  manualActive: PositionStatus
  sectorsSyncedToOnline: boolean
  positionSyncedToOnline: boolean
  selectedPosition: string | null
  controlType: "presets" | "manual"
}
