export const zn = (n: number) => (x: number | string) =>
  String(x).padStart(n, "0")
export const z2 = zn(2)
export const z3 = zn(3)
export const z4 = zn(4)
