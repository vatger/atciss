export const zn = (n: number) => (x: number) =>
  (x < 0 ? "M" : "") + String(Math.abs(x)).padStart(n, "0")
export const z2 = zn(2)
export const z3 = zn(3)
export const z4 = zn(4)

export function localStorageOrDefault<T>(item: string, fallback: T): T {
  const localStorageValue = localStorage.getItem(item)

  return localStorageValue ? JSON.parse(localStorageValue) : fallback
}

export function setLocalStorage<T>(item: string, value: T): T {
  localStorage.setItem(item, JSON.stringify(value))

  return value
}

export const tafFormat = (taf: string) =>
  taf
    ?.replace(/.*?[A-Z]{4}\s/, "")
    .replaceAll(/\s(BECMG|PROB\d{2}\sTEMPO|TEMPO|FM\d{6})/g, "\n  $1")

export const deltaArrow = (
  current_value: string | number | null | undefined,
  prev_value: string | number | null | undefined,
) => {
  if (current_value == null || prev_value == null) return ""
  const cur =
    typeof current_value === "number" ? current_value : Number(current_value)
  const prev = typeof prev_value === "number" ? prev_value : Number(prev_value)
  return cur > prev ? "↑" : cur < prev ? "↓" : ""
}
