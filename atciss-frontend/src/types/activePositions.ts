export type PositionStatus = { [id: string]: boolean }

export type ActivePositionState = {
  manualActive: PositionStatus
  sectorsSyncedToOnline: boolean
  positionSyncedToOnline: boolean
  selectedPosition: string | null
}
