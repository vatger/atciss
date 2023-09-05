type EBG = {
  fir: string
  uir: string
  sectors: string[]
  majorAerodromes: string[]
  minorAerodromes: string[]
  aerodromes: string[]
  relevantAerodromes: string[]
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
    aerodromes: ["EDJA", "EDMA", "EDMO", "ETSI", "ETSL", "ETSN"],
    minorAerodromes: ["EDME", "EDMS", "EDMX", "EDPR", "ETHL"],
    relevantAerodromes: ["EDDS", "EDDF"],
  },
  EDMM_E: {
    fir: "EDMM",
    uir: "EDUU",
    sectors: ["BBG", "FRK", "GER", "HAL", "HOF", "MEI", "SAS", "TRN", "TRS"],
    majorAerodromes: ["EDDN", "EDDP"],
    aerodromes: ["EDDC", "EDDE", "EDQM"],
    minorAerodromes: ["EDAB", "EDQD", "EDQC", "EDQA", "ETEB", "ETIC"],
    relevantAerodromes: [],
  },
}
