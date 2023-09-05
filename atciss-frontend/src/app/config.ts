export const VATSIM_AUTH_URL = "https://auth-dev.vatsim.net"
export const VATSIM_CLIENT_ID = "592"

type EBG = {
  fir: string
  uir: string
  sectors: string[]
  majorAerodromes: string[]
  aerodromes: string[]
}
export const EBG_SETTINGS: { [name: string]: EBG } = {
  EDMM_W: {
    fir: "EDMM",
    uir: "EDUU",
    sectors: [
      "ALB",
      "EGG",
      "FUE",
      "ILR",
      "NDG",
      "RDG",
      "STA",
      "SWA",
      "TEG",
      "TRU",
      "WLD",
      "ZUG",
    ],
    majorAerodromes: ["EDDM"],
    aerodromes: [
      "EDJA",
      "EDMA",
      // "EDME",
      "EDMO",
      // "EDMS",
      // "EDMX",
      // "EDPR",
      // "ETHL",
      "ETSI",
      "ETSL",
      "ETSN",
    ],
    // "EDDS", "EDDF"
  },
  EDMM_E: {
    fir: "EDMM",
    uir: "EDUU",
    sectors: ["BBG", "FRK", "GER", "HAL", "HOF", "MEI", "SAS", "TRN", "TRS"],
    majorAerodromes: ["EDDN", "EDDP"],
    aerodromes: [
      "EDDC",
      "EDDE",
      "EDQM",
      // "EDAB",
      // "EDQD",
      // "EDQC",
      // "EDQA",
      // "ETEB",
      // "ETIC",
    ],
  },
}
