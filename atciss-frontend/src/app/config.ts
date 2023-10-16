type EBG = {
  fir: string
  uir: string
  sectors: string[]
  majorAerodromes: string[]
  minorAerodromes: string[]
  aerodromes: string[]
  relevantAerodromes: string[]
  neighbourPrefixes: string[]
  neighbourFirs: string[]
}
export const EBG_SETTINGS: { [name: string]: EBG } = {
  EDMM_W: {
    fir: "EDMM",
    uir: "EDUU",
    sectors: [
      "ed/ALB",
      "ed/EGG",
      "ed/FUE",
      "ed/ILR",
      "ed/NDG",
      "ed/RDG",
      "ed/STA",
      "ed/SWA",
      "ed/TEG",
      "ed/TRU",
      "ed/WLD",
      "ed/ZUG",
    ],
    majorAerodromes: ["EDDM"],
    aerodromes: ["EDJA", "EDMA", "EDMO", "ETSI", "ETSL", "ETSN"],
    minorAerodromes: ["EDME", "EDMS", "EDMX", "EDPR", "ETHL"],
    relevantAerodromes: ["EDDS", "EDDF"],
    neighbourPrefixes: ["ED", "ET", "LK", "LO", "LS"],
    neighbourFirs: ["EDGG", "LKAA", "LOVV", "LSAS"],
  },
  EDMM_E: {
    fir: "EDMM",
    uir: "EDUU",
    sectors: [
      "ed/BBG",
      "ed/FRK",
      "ed/GER",
      "ed/HAL",
      "ed/HOF",
      "ed/MEI",
      "ed/SAS",
      "ed/TRN",
      "ed/TRS",
    ],
    majorAerodromes: ["EDDN", "EDDP"],
    aerodromes: ["EDDC", "EDDE", "EDQM"],
    minorAerodromes: ["EDAB", "EDQD", "EDQC", "EDQA", "ETEB", "ETIC"],
    relevantAerodromes: [],
    neighbourPrefixes: ["ED", "ET", "EP", "LK"],
    neighbourFirs: ["EDGG", "EDWW", "EPWW", "LKAA"],
  },
  // TODO: IRL different layout
  EDGG07: {
    fir: "EDGG",
    uir: "EDYY",
    sectors: ["ed/NOR", "ed/TAU", "ed/PADH", "ed/HMM", "ed/BOT", "ed/DUS"],
    majorAerodromes: ["EDDK", "EDDL"],
    aerodromes: ["EDLN", "ETNN", "ETNG"],
    minorAerodromes: [],
    relevantAerodromes: [],
    neighbourPrefixes: ["ED", "ET", "EB", "EH", "EL", "LF"],
    neighbourFirs: ["EHAA", "EBBU", "EDWW", "LFEE"],
  },
}
export const FIR_TO_VATGLASSES: { [fir: string]: string } = {
  EDMM: "ed",
  EDUU: "ed",
  EDGG: "ed",
  EDWW: "ed",
  EDYY: "ed",
  EBBU: "eb-el",
  EHAA: "eh",
  EKDK: "ek",
  ESMM: "es",
  LIPP: "li",
  LKAA: "lk",
  LOVV: "lo",
  // EPWW: "ep",
  // LSAS: "ls",
}
