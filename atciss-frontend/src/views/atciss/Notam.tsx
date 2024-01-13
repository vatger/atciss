import { useAppSelector } from "app/hooks"
import { SidebarLayout } from "components/SidebarLayout"
import { NotamControls } from "components/atciss/notam/NotamControls"
import { NotamsByDesignator } from "components/atciss/notam/NotamsByDesignator"
import { api } from "services/api"
import { selectNotamDesignators } from "services/configSlice"
import { usePollNotamByIcaoCodes } from "services/notamApi"
import { Flex, ThemeUIStyleObject } from "theme-ui"

export const Notams = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const designators = useAppSelector(selectNotamDesignators)
  usePollNotamByIcaoCodes(designators)
  api.useNotamsSeenQuery()

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
