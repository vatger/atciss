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
