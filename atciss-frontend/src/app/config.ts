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
  areas: string[]
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
    areas: [
      "ED-R107C",
      "ED-R107W",
      "ED-R207C",
      "ED-R207S",
      "ED-R207W",
      "ED-R170A",
      "ED-R170B",
      "ED-R171",
    ],
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
    areas: [
      "ED-R136A",
      "ED-R136B",
      "ED-R136C",
      "ED-R137A",
      "ED-R137B",
      "ED-R170A",
      "ED-R170B",
      "ED-R171",
      "ED-R208A",
      "ED-R208B",
      "ED-R308",
    ],
  },
  // TODO: IRL different layout
  EDGG02: {
    fir: "EDGG",
    uir: "EDUU",
    sectors: ["ed/BAD", "ed/MAN", "ed/LBU", "ed/NKRH", "ed/NKRL"],
    majorAerodromes: ["EDDF", "EDDS"],
    aerodromes: ["ETAR", "EDFM"],
    minorAerodromes: [],
    relevantAerodromes: [],
    neighbourPrefixes: ["ED", "ET", "LF", "LS"],
    neighbourFirs: ["EDMM", "LFEE", "LSAS"],
    areas: [
      "ED-R132A",
      "ED-R132B",
      "ED-R205A",
      "ED-R205B",
      "ED-R205C",
      "ED-R205D",
      "ED-R207C",
      "ED-R207S",
      "ED-R207W",
    ],
  },
  // TODO: IRL different layout
  EDGG03: {
    fir: "EDGG",
    uir: "EDYY",
    sectors: ["ed/GED", "ed/SIG", "ed/TAU", "ed/GIN", "ed/HEF"],
    majorAerodromes: ["EDDF"],
    aerodromes: ["ETOU"],
    minorAerodromes: [],
    relevantAerodromes: [],
    neighbourPrefixes: ["ED", "ET", "LF"],
    neighbourFirs: ["EDMM", "LFEE", "LSAS"],
    areas: [
      "ED-R134",
      "ED-R135A",
      "ED-R135B",
      "ED-R135C",
      "ED-R97A",
      "ED-R97B",
    ],
  },
  // TODO: IRL different layout
  EDGG07: {
    fir: "EDGG",
    uir: "EDYY",
    sectors: ["ed/DKA", "ed/NOR", "ed/PADL", "ed/PADH", "ed/BOT", "ed/DUS"],
    majorAerodromes: ["EDDK", "EDDL"],
    aerodromes: ["EDDG", "EDLV", "EDLW", "EDLP", "EDLN", "ETNN", "ETNG"],
    minorAerodromes: [],
    relevantAerodromes: [],
    neighbourPrefixes: ["ED", "ET", "EB", "EH", "EL", "LF"],
    neighbourFirs: ["EHAA", "EBBU", "EDWW", "LFEE"],
    areas: ["ED-R117"],
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
  EPWW: "ep",
  LSAS: "ls",
}
