/** @jsxImportSource theme-ui */

import { Box, Flex, Input, ThemeUIStyleObject } from "theme-ui"
import { SectorControls } from "../components/SectorControls"
import { useAppSelector } from "../app/hooks"
import { selectOwnedSectors } from "../services/activePositionSlice"
import {
  loaApi,
  selectFilteredEntryLoas,
  selectFilteredExitLoas,
} from "../services/loaApi"
import { LoaRow } from "../components/LoaRow"
import { useState } from "react"
import { SidebarLayout } from "../components/SidebarLayout"

export const LOA = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const ownedSectors = useAppSelector(selectOwnedSectors)
  const { data: _l } = loaApi.useGetBySectorsQuery(ownedSectors, {
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
                key={`${loa.cop}-${loa.aerodrome}-${loa.adep_ades}-${loa.from_sector}-${loa.to_sector}-${idx}`}
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
                key={`${loa.cop}-${loa.aerodrome}-${loa.adep_ades}-${loa.from_sector}-${loa.to_sector}-${idx}`}
                loa={loa}
              />
            ))}
          </tbody>
        </table>
      </Box>
      <Flex
        sx={{ flexDirection: "column", gap: 2, overflow: "hidden", padding: 2 }}
      >
        <Input
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <SectorControls />
      </Flex>
    </SidebarLayout>
  )
}
