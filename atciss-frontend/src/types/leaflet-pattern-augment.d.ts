import "leaflet"

declare module "leaflet" {
  interface PatternOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    patternUnits?: string
    patternContentUnits?: string
    angle?: number
    patternTransform?: string
  }

  class Pattern extends Layer {
    constructor(options?: PatternOptions)
    addTo(map: Map): this
    remove(): this
  }

  interface StripePatternOptions extends PatternOptions {
    weight?: number
    spaceWeight?: number
    color?: string
    spaceColor?: string
    opacity?: number
    spaceOpacity?: number
  }

  class StripePattern extends Pattern {
    constructor(options?: StripePatternOptions)
  }

  function stripePattern(options?: StripePatternOptions): StripePattern

  interface PathOptions {
    fillPattern?: Pattern
  }
}
