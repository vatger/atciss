export interface LoaItem {
  aerodrome: string // FIXME: should be string[]
  adep_ades: "ADEP" | "ADES" | null
  cop: string
  level: number
  feet: boolean
  xc: string | null
  special_conditions: string
  from_sector: string
  to_sector: string
  from_fir: string
  to_fir: string
}
