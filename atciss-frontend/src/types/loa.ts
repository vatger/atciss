export interface LoaItem {
  from_sector: string
  to_sector: string
  ades: string[] | null
  adep: string[] | null
  cop: string | null
  runway: string[] | null
  route_before: string | null
  route_after: string | null
  level: number
  sfl: number | null
  qnh: string | null
  level_at: [number, string] | null
  transfer_type: "C" | "D" | null
  releases: "F" | "T" | "C" | "D" | null
  remarks: string | null
  areas: string[] | null
  rfl: string | null
}

export interface LoaDoc {
  filename: string
  name: string
  related_firs: string[] | null
  firs: string[]
  keywords: string[] | null
  airac: number
  effective_date: string
}
