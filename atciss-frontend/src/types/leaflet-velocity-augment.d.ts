import "leaflet"

declare module "leaflet" {
  interface VelocityGridHeader {
    parameterCategory: number
    parameterNumber: number
    parameterUnit?: string
    parameterNumberName?: string
    lo1: number
    la1: number
    dx: number
    dy: number
    nx: number
    ny: number
    refTime: string
    forecastTime: number
  }

  interface VelocityGridRecord {
    header: VelocityGridHeader
    data: number[]
  }

  type VelocityData = VelocityGridRecord[]

  interface VelocityLayerOptions extends LayerOptions {
    data: VelocityData
    displayValues?: boolean
    displayOptions?: {
      velocityType?: string
      position?: string
      emptyString?: string
      speedUnit?: "m/s" | "k/h" | "mph" | "kt"
      directionString?: string
      speedString?: string
      showCardinal?: boolean
      angleConvention?: string
    }
    paneName?: string
    minVelocity?: number
    maxVelocity?: number
    velocityScale?: number
    particleAge?: number
    lineWidth?: number
    particleMultiplier?: number
    frameRate?: number
    colorScale?: string[]
  }

  class VelocityLayer extends Layer {
    constructor(options: VelocityLayerOptions)
    setData(data: VelocityData): void
    setOptions(options: Partial<VelocityLayerOptions>): void
  }

  function velocityLayer(options: VelocityLayerOptions): VelocityLayer
}
