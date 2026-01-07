import { useThemeUI } from "theme-ui"
import { Metar } from "types/wx"

const roseSegmentClasses = (metar: Metar, segment: number): string => {
  if (metar.wind_dir_from && metar.wind_dir_to) {
    const start_segment = metar.wind_dir_from - (metar.wind_dir_from % 10)
    const end_segment = metar.wind_dir_to - (metar.wind_dir_to % 10)

    for (let s = start_segment; s != end_segment; s += 10) {
      if (s == segment) return "st1 st1-active"
      if (s == 360) s = -10
    }
  }

  return "st1"
}

export const AnalogWindRose = ({ metar }: { metar: Metar }) => {
  const theme_context = useThemeUI()
  const text_color = theme_context.theme.rawColors?.text || "#000"
  const wind_rose_color =
    theme_context.theme.rawColors?.windRoseActive || "#666"

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 440 440"
      width="220"
      height="220"
    >
      <defs>
        <style>
          {`
            g, path { transition: all 1s ease-out; }
            .st0 { font-size: 2.2rem; fill: ${text_color};}
            .st1 { fill: none; stroke: ${text_color}; }
            .st1-active { fill: ${wind_rose_color}; }
            .rose-circle { fill: ${text_color}; }
            #needle { transform-origin: center center; transform: rotate(${metar.wind_dir}deg); }
            #Pointer { fill: ${text_color}; }
          `}
        </style>
      </defs>
      <g id="Rose">
        <path
          id="segment_0"
          className={roseSegmentClasses(metar, 0)}
          d="M241.2,99.78l4.41-25.03c-8.37-1.46-16.94-2.2-25.61-2.2v25.41c7.18,0,14.27.62,21.2,1.82Z"
        />
        <path
          id="segment_10"
          className={roseSegmentClasses(metar, 10)}
          d="M261.76,105.26l8.7-23.89c-8.04-2.92-16.34-5.14-24.85-6.62l-4.41,25.03c7.04,1.23,13.91,3.06,20.56,5.48Z"
        />
        <path
          id="segment_20"
          className={roseSegmentClasses(metar, 20)}
          d="M281.04,114.27l12.71-22.02c-7.44-4.31-15.23-7.95-23.3-10.88l-8.7,23.89c6.67,2.42,13.12,5.44,19.28,9.01Z"
        />
        <path
          id="segment_30"
          className={roseSegmentClasses(metar, 30)}
          d="M298.45,126.51l16.34-19.47c-6.62-5.57-13.65-10.51-21.03-14.79l-12.71,22.02c6.11,3.54,11.93,7.63,17.4,12.24Z"
        />
        <path
          id="segment_40"
          className={roseSegmentClasses(metar, 40)}
          d="M306.3,133.7c2.53,2.53,4.92,5.15,7.19,7.85l19.47-16.34c-2.75-3.26-5.64-6.43-8.69-9.48s-6.22-5.94-9.48-8.69l-16.34,19.47c2.7,2.27,5.32,4.67,7.85,7.19Z"
        />
        <path
          id="segment_50"
          className={roseSegmentClasses(metar, 50)}
          d="M325.73,158.96l22.02-12.71c-4.28-7.38-9.21-14.41-14.79-21.03l-19.47,16.34c4.61,5.48,8.7,11.3,12.24,17.4Z"
        />
        <path
          id="segment_60"
          className={roseSegmentClasses(metar, 60)}
          d="M334.74,178.24l23.89-8.7c-2.93-8.06-6.57-15.85-10.88-23.3l-22.02,12.71c3.57,6.16,6.58,12.61,9.01,19.28Z"
        />
        <path
          id="segment_70"
          className={roseSegmentClasses(metar, 70)}
          d="M340.22,198.8l25.03-4.41c-1.48-8.5-3.7-16.81-6.62-24.85l-23.89,8.7c2.42,6.65,4.26,13.53,5.48,20.56Z"
        />
        <path
          id="segment_80"
          className={roseSegmentClasses(metar, 80)}
          d="M340.22,198.8c1.21,6.93,1.82,14.02,1.82,21.2h25.41c0-8.68-.75-17.24-2.2-25.61l-25.03,4.41Z"
        />
        <path
          id="segment_90"
          className={roseSegmentClasses(metar, 90)}
          d="M340.22,241.2l25.03,4.41c1.46-8.37,2.2-16.94,2.2-25.61h-25.41c0,7.18-.62,14.27-1.82,21.2Z"
        />
        <path
          id="segment_100"
          className={roseSegmentClasses(metar, 100)}
          d="M334.74,261.76l23.89,8.7c2.92-8.04,5.14-16.34,6.62-24.85l-25.03-4.41c-1.23,7.04-3.06,13.91-5.48,20.56Z"
        />
        <path
          id="segment_110"
          className={roseSegmentClasses(metar, 110)}
          d="M325.73,281.04l22.02,12.71c4.31-7.44,7.95-15.23,10.88-23.3l-23.89-8.7c-2.42,6.67-5.44,13.12-9.01,19.28Z"
        />
        <path
          id="segment_120"
          className={roseSegmentClasses(metar, 120)}
          d="M313.49,298.45l19.47,16.34c5.57-6.62,10.51-13.65,14.79-21.03l-22.02-12.71c-3.54,6.11-7.63,11.93-12.24,17.4Z"
        />
        <path
          id="segment_130"
          className={roseSegmentClasses(metar, 130)}
          d="M306.3,306.3c-2.53,2.53-5.15,4.92-7.85,7.19l16.34,19.47c3.26-2.75,6.43-5.64,9.48-8.69s5.94-6.22,8.69-9.48l-19.47-16.34c-2.27,2.7-4.67,5.32-7.19,7.85Z"
        />
        <path
          id="segment_140"
          className={roseSegmentClasses(metar, 140)}
          d="M281.04,325.73l12.71,22.02c7.38-4.28,14.41-9.21,21.03-14.79l-16.34-19.47c-5.48,4.61-11.3,8.7-17.4,12.24Z"
        />
        <path
          id="segment_150"
          className={roseSegmentClasses(metar, 150)}
          d="M261.76,334.74l8.7,23.89c8.06-2.93,15.85-6.57,23.3-10.88l-12.71-22.02c-6.16,3.57-12.61,6.58-19.28,9.01Z"
        />
        <path
          id="segment_160"
          className={roseSegmentClasses(metar, 160)}
          d="M241.2,340.22l4.41,25.03c8.5-1.48,16.81-3.7,24.85-6.62l-8.7-23.89c-6.65,2.42-13.53,4.26-20.56,5.48Z"
        />
        <path
          id="segment_170"
          className={roseSegmentClasses(metar, 170)}
          d="M220,342.04v25.41c8.68,0,17.24-.75,25.61-2.2l-4.41-25.03c-6.93,1.21-14.02,1.82-21.2,1.82Z"
        />
        <path
          id="segment_180"
          className={roseSegmentClasses(metar, 180)}
          d="M198.8,340.22l-4.41,25.03c8.37,1.46,16.94,2.2,25.61,2.2v-25.41c-7.18,0-14.27-.62-21.2-1.82Z"
        />
        <path
          id="segment_190"
          className={roseSegmentClasses(metar, 190)}
          d="M178.24,334.74l-8.7,23.89c8.04,2.92,16.34,5.14,24.85,6.62l4.41-25.03c-7.04-1.23-13.91-3.06-20.56-5.48Z"
        />
        <path
          id="segment_200"
          className={roseSegmentClasses(metar, 200)}
          d="M158.96,325.73l-12.71,22.02c7.44,4.31,15.23,7.95,23.3,10.88l8.7-23.89c-6.67-2.42-13.12-5.44-19.28-9.01Z"
        />
        <path
          id="segment_210"
          className={roseSegmentClasses(metar, 210)}
          d="M141.55,313.49l-16.34,19.47c6.62,5.57,13.65,10.51,21.03,14.79l12.71-22.02c-6.11-3.54-11.93-7.63-17.4-12.24Z"
        />
        <path
          id="segment_220"
          className={roseSegmentClasses(metar, 220)}
          d="M133.7,306.3c-2.53-2.53-4.92-5.15-7.19-7.85l-19.47,16.34c2.75,3.26,5.64,6.43,8.69,9.48s6.22,5.94,9.48,8.69l16.34-19.47c-2.7-2.27-5.32-4.67-7.85-7.19Z"
        />
        <path
          id="segment_230"
          className={roseSegmentClasses(metar, 230)}
          d="M114.27,281.04l-22.02,12.71c4.28,7.38,9.21,14.41,14.79,21.03l19.47-16.34c-4.61-5.48-8.7-11.3-12.24-17.4Z"
        />
        <path
          id="segment_240"
          className={roseSegmentClasses(metar, 240)}
          d="M105.26,261.76l-23.89,8.7c2.93,8.06,6.57,15.85,10.88,23.3l22.02-12.71c-3.57-6.16-6.58-12.61-9.01-19.28Z"
        />
        <path
          id="segment_250"
          className={roseSegmentClasses(metar, 250)}
          d="M99.78,241.2l-25.03,4.41c1.48,8.5,3.7,16.81,6.62,24.85l23.89-8.7c-2.42-6.65-4.26-13.53-5.48-20.56Z"
        />
        <path
          id="segment_260"
          className={roseSegmentClasses(metar, 260)}
          d="M97.96,220h-25.41c0,8.68.75,17.24,2.2,25.61l25.03-4.41c-1.21-6.93-1.82-14.02-1.82-21.2Z"
        />
        <path
          id="segment_270"
          className={roseSegmentClasses(metar, 270)}
          d="M99.78,198.8l-25.03-4.41c-1.46,8.37-2.2,16.94-2.2,25.61h25.41c0-7.18.62-14.27,1.82-21.2Z"
        />
        <path
          id="segment_280"
          className={roseSegmentClasses(metar, 280)}
          d="M105.26,178.24l-23.89-8.7c-2.92,8.04-5.14,16.34-6.62,24.85l25.03,4.41c1.23-7.04,3.06-13.91,5.48-20.56Z"
        />
        <path
          id="segment_290"
          className={roseSegmentClasses(metar, 290)}
          d="M114.27,158.96l-22.02-12.71c-4.31,7.44-7.95,15.23-10.88,23.3l23.89,8.7c2.42-6.67,5.44-13.12,9.01-19.28Z"
        />
        <path
          id="segment_300"
          className={roseSegmentClasses(metar, 300)}
          d="M126.51,141.55l-19.47-16.34c-5.57,6.62-10.51,13.65-14.79,21.03l22.02,12.71c3.54-6.11,7.63-11.93,12.24-17.4Z"
        />
        <path
          id="segment_310"
          className={roseSegmentClasses(metar, 310)}
          d="M133.7,133.7c2.53-2.53,5.15-4.92,7.85-7.19l-16.34-19.47c-3.26,2.75-6.43,5.64-9.48,8.69-3.05,3.05-5.94,6.22-8.69,9.48l19.47,16.34c2.27-2.7,4.67-5.32,7.19-7.85Z"
        />
        <path
          id="segment_320"
          className={roseSegmentClasses(metar, 320)}
          d="M158.96,114.27l-12.71-22.02c-7.38,4.28-14.41,9.21-21.03,14.79l16.34,19.47c5.48-4.61,11.3-8.7,17.4-12.24Z"
        />
        <path
          id="segment_330"
          className={roseSegmentClasses(metar, 330)}
          d="M178.24,105.26l-8.7-23.89c-8.06,2.93-15.85,6.57-23.3,10.88l12.71,22.02c6.16-3.57,12.61-6.58,19.28-9.01Z"
        />
        <path
          id="segment_340"
          className={roseSegmentClasses(metar, 340)}
          d="M198.8,99.78l-4.41-25.03c-8.5,1.48-16.81,3.7-24.85,6.62l8.7,23.89c6.65-2.42,13.53-4.26,20.56-5.48Z"
        />
        <path
          id="segment_350"
          className={roseSegmentClasses(metar, 350)}
          d="M220,97.96v-25.41c-8.68,0-17.24.75-25.61,2.2l4.41,25.03c6.93-1.21,14.02-1.82,21.2-1.82Z"
        />
        <path
          className="rose-circle"
          d="M220,73.54c39.12,0,75.9,15.23,103.56,42.9,27.66,27.66,42.9,64.44,42.9,103.56s-15.23,75.9-42.9,103.56c-27.66,27.66-64.44,42.9-103.56,42.9s-75.9-15.23-103.56-42.9c-27.66-27.66-42.9-64.44-42.9-103.56s15.23-75.9,42.9-103.56c27.66-27.66,64.44-42.9,103.56-42.9M220,71.54c-81.99,0-148.46,66.47-148.46,148.46s66.47,148.46,148.46,148.46,148.46-66.47,148.46-148.46-66.47-148.46-148.46-148.46h0Z"
        />
        <path
          className="rose-circle"
          d="M220,99.33c32.23,0,62.54,12.55,85.33,35.34,22.79,22.79,35.34,53.1,35.34,85.33s-12.55,62.54-35.34,85.33c-22.79,22.79-53.1,35.34-85.33,35.34s-62.54-12.55-85.33-35.34c-22.79-22.79-35.34-53.1-35.34-85.33s12.55-62.54,35.34-85.33,53.1-35.34,85.33-35.34M220,97.33c-67.75,0-122.67,54.92-122.67,122.67s54.92,122.67,122.67,122.67,122.67-54.92,122.67-122.67-54.92-122.67-122.67-122.67h0Z"
        />
      </g>
      <g id="Pointer">
        <circle className="st2" cx="220" cy="220" r="14.81" />
        <polygon
          id="needle"
          points="219.85 75 210.2 221.5 229.5 221.5 219.85 75"
        />
      </g>
      <g id="Labels">
        <text className="st0" transform="translate(208.4 138.4)">
          <tspan x="0" y="0">
            N
          </tspan>
        </text>
        <text className="st0" transform="translate(211.2 326.56)">
          <tspan x="0" y="0">
            S
          </tspan>
        </text>
        <text className="st0" transform="translate(114.84 230.57)">
          <tspan x="0" y="0">
            W
          </tspan>
        </text>
        <text className="st0" transform="translate(307.22 230.57)">
          <tspan x="0" y="0">
            E
          </tspan>
        </text>
        <text className="st0" transform="translate(192.3 52.56)">
          <tspan x="0" y="0">
            360
          </tspan>
        </text>
        <text className="st0" transform="translate(191.81 411.02)">
          <tspan x="0" y="0">
            180
          </tspan>
        </text>
        <text className="st0" transform="translate(382.04 230.57)">
          <tspan x="0" y="0">
            90
          </tspan>
        </text>
        <text className="st0" transform="translate(5.81 230.57)">
          <tspan x="0" y="0">
            270
          </tspan>
        </text>
        <text className="st0" transform="translate(294.57 79.17)">
          <tspan x="0" y="0">
            30
          </tspan>
        </text>
        <text className="st0" transform="translate(359.57 138.17)">
          <tspan x="0" y="0">
            60
          </tspan>
        </text>
        <text className="st0" transform="translate(355.34 326.17)">
          <tspan x="0" y="0">
            120
          </tspan>
        </text>
        <text className="st0" transform="translate(296.34 386.17)">
          <tspan x="0" y="0">
            150
          </tspan>
        </text>
        <text className="st0" transform="translate(96.34 386.17)">
          <tspan x="0" y="0">
            210
          </tspan>
        </text>
        <text className="st0" transform="translate(29.34 327.17)">
          <tspan x="0" y="0">
            240
          </tspan>
        </text>
        <text className="st0" transform="translate(23.34 138.17)">
          <tspan x="0" y="0">
            300
          </tspan>
        </text>
        <text className="st0" transform="translate(85.34 79.17)">
          <tspan x="0" y="0">
            330
          </tspan>
        </text>
      </g>
    </svg>
  )
}
