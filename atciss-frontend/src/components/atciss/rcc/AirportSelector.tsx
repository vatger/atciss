/** @jsxImportSource theme-ui */

import { skipToken } from "@reduxjs/toolkit/query"
import { XmSelect } from "components/atciss/XmSelect"
import { usePollRawMetar } from "services/metarApi"
import { Aerodrome } from "types/dfs"
import { Box, Text } from "theme-ui"

export const AirportSelector = ({
  icaos,
  aerodromes,
  value,
  onChange,
}: {
  icaos: string[]
  aerodromes: Record<string, Aerodrome>
  value: string | null
  onChange: (icao: string | null) => void
}) => {
  const { data: rawMetar } = usePollRawMetar(value ?? skipToken)

  return (
    <Box
      sx={{ display: "grid", gridTemplateColumns: ["1fr", "1fr 1fr"], gap: 3 }}
    >
      <Box>
        <Text variant="label">Airport</Text>
        <XmSelect
          sx={{ width: "100%", mt: 1 }}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">Select airport</option>
          {icaos.map((icao) => (
            <option key={icao} value={icao}>
              {icao}
              {aerodromes[icao]?.name ? ` - ${aerodromes[icao].name}` : ""}
            </option>
          ))}
        </XmSelect>
        {value && (
          <a
            href={`https://atis.guru/atis/${value}`}
            target="_blank"
            rel="noreferrer"
            sx={{
              fontSize: 0,
              mt: 1,
              display: "inline-block",
              color: "primary",
            }}
          >
            open ATIS.guru (real-world ATIS, may be outdated) ↗
          </a>
        )}
      </Box>
      <Box>
        <Text variant="label">METAR</Text>
        <Box
          sx={{
            p: 2,
            mt: 1,
            borderStyle: "inset",
            fontFamily: "monospace",
            fontSize: 1,
            minHeight: "2.5em",
            wordBreak: "break-word",
          }}
        >
          {value
            ? rawMetar
              ? rawMetar.replace(/.*?[A-Z]{4}\s/, "")
              : "…"
            : "No airport selected"}
        </Box>
      </Box>
    </Box>
  )
}
