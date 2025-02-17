/** @jsxImportSource theme-ui */

import { useAppSelector } from "app/hooks"
import { SidebarLayout } from "components/SidebarLayout"
import { LoaRow } from "components/atciss/LoaRow"
import { SectorControls } from "components/atciss/SectorControls"
import { XmInput } from "components/atciss/XmInput"
import { useState } from "react"
import { selectOwnedSectors } from "services/activePositions"
import { api } from "services/api"
import {
  selectFilteredEntryLoas,
  selectFilteredExitLoas,
} from "services/loaApi"
import { Box, Flex, ThemeUIStyleObject } from "theme-ui"

export const LOA = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const ownedSectors = useAppSelector(selectOwnedSectors)
  api.useLoaBySectorsQuery(ownedSectors, {
    skip: ownedSectors.length == 0,
  })
  const [filter, setFilter] = useState("")

  const xLoas = useAppSelector((state) => selectFilteredExitLoas(state, filter))
  const nLoas = useAppSelector((state) =>
    selectFilteredEntryLoas(state, filter),
  )

  return (
    <SidebarLayout sx={sx}>
      <Box>
        <table sx={{ width: "100%" }}>
          <thead>
            <tr>
              <th>COPX</th>
              <th>ADEP/ADES</th>
              <th>FL</th>
              <th>REMARK</th>
              <th>FROM</th>
              <th>TO</th>
            </tr>
          </thead>
          <tbody>
            {xLoas?.map((loa, idx) => (
              <LoaRow
                key={`${loa.cop}-${loa.adep?.join("_")}-${loa.ades?.join("_")}-${loa.from_sector}-${loa.to_sector}-${idx}`}
                loa={loa}
              />
            ))}
          </tbody>
          <thead>
            <tr>
              <th>COPN</th>
              <th>ADEP/ADES</th>
              <th>FL</th>
              <th>REMARK</th>
              <th>FROM</th>
              <th>TO</th>
            </tr>
          </thead>
          <tbody>
            {nLoas?.map((loa, idx) => (
              <LoaRow
                key={`${loa.cop}-${loa.adep?.join("_")}-${loa.ades?.join("_")}-${loa.from_sector}-${loa.to_sector}-${idx}`}
                loa={loa}
              />
            ))}
          </tbody>
        </table>
      </Box>
      <Flex
        sx={{ flexDirection: "column", gap: 2, overflow: "hidden", padding: 2 }}
      >
        <XmInput
          value={filter}
          type="search"
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            fontSize: "1.2rem",
            fontFamily: "monospace",
            fontWeight: "bold",
          }}
          placeholder={"Filter"}
        />
        <SectorControls />
      </Flex>
    </SidebarLayout>
  )
}
