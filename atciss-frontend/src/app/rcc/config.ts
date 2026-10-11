// Runway directions that exist in the DFS AIXM data but aren't used
// operationally at that aerodrome (or just used for VFR traffic), so they shouldn't be offered as
// selectable runways in the RCC generator.
export const EXCLUDED_RUNWAYS: Record<string, string[]> = {
  EDDW: ["23"],
  EDDV: ["27C", "09C"],
  EDDF: ["36", "07Y", "25Y"],
  EDDN: ["28Y", "10Y"],
}
