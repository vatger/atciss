import { Flex, ThemeUIStyleObject } from "theme-ui"
import { usePollNotamByIcaoCodes, notamApi } from "../services/notamApi"
import { useAppSelector } from "../app/hooks"
import { selectNotamDesignators } from "../services/configSlice"
import { SidebarLayout } from "../components/SidebarLayout"
import { NotamsByDesignator } from "../components/notam/NotamsByDesignator"
import { NotamControls } from "../components/notam/NotamControls"

export const Notams = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const designators = useAppSelector(selectNotamDesignators)
  const { data: _n } = usePollNotamByIcaoCodes(designators)
  const { data: _ns } = notamApi.useGetSeenQuery()

  return (
    <SidebarLayout sx={sx}>
      <Flex sx={{ flexDirection: "column", padding: 2, gap: 2 }}>
        {designators.map((icao, idx) => {
          return (
            <details key={icao} open={idx === 0}>
              <NotamsByDesignator icao={icao} />
            </details>
          )
        })}
      </Flex>
      <NotamControls />
    </SidebarLayout>
  )
}
