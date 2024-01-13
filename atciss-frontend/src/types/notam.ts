export type Notam = {
  full_text: string
  notam_id: string
  notam_type: string
  ref_notam_id: string | null
  fir: string
  notam_code: string
  traffic_type: string[]
  purpose: string[]
  scope: string[]
  fl_lower: number
  fl_upper: number
  area: { [index: string]: string | number }
  location: string[]
  valid_from: string
  valid_till: string
  schedule: string | null
  body: string
  limit_lower: string | null
  limit_upper: string | null
  source: string | null
  created: string | null
}
