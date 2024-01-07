import { useAppDispatch, useAppSelector } from "app/hooks"
import { ADinfo } from "components/atciss/atis-afw/ADInfo"
import { Agreements } from "components/atciss/atis-afw/Agreements"
import { Areas } from "components/atciss/atis-afw/Areas"
import { Atis } from "components/atciss/atis-afw/Atis"
import { ECFMP } from "components/atciss/atis-afw/ECFMP"
import { Events } from "components/atciss/atis-afw/Events"
import { SectorStaffing } from "components/atciss/atis-afw/SectorStaffing"
import { SectorStatus } from "components/atciss/atis-afw/SectorStatus"
import {
  selectActivePageName,
  selectPageNames,
  setActivePage,
} from "services/atisAfwSlice"
import { selectActiveFir } from "services/configSlice"
import { Button, Flex, Grid, ThemeUIStyleObject } from "theme-ui"

const AtisAfwNav = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const dispatch = useAppDispatch()
  const fir = useAppSelector(selectActiveFir)
  const pages = useAppSelector(selectPageNames)
  const activePage = useAppSelector(selectActivePageName)

  return (
    <Flex
      sx={{
        ...sx,
        backgroundColor: "secondary",
        borderBottom: 2,
        borderBottomColor: "darkshadow",
        borderBottomStyle: "solid",
        p: 2,
        gap: 2,
        alignItems: "start",
      }}
    >
      <Grid
        sx={{
          gap: ".5rem",
          gridTemplateColumns: "repeat(auto-fit, 6rem)",
          flex: "auto",
        }}
      >
        {pages.map((page) => (
          <Button
            variant={
              page === activePage ? "selectedSecondaryNav" : "secondaryNav"
            }
            onClick={() => {
              dispatch(setActivePage({ fir, page }))
            }}
            key={page}
          >
            {page}
          </Button>
        ))}
      </Grid>
    </Flex>
  )
}

const gridItemSx: ThemeUIStyleObject = {
  padding: "1",
  backgroundColor: "background",
}

const AtisAfw = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  return (
    <Grid
      sx={{
        ...sx,
        gridTemplate: "auto 3fr 2fr / 2fr 1fr 2fr",
        gap: "2px",
        backgroundColor: "red",
      }}
    >
      <AtisAfwNav sx={{ gridColumnEnd: "span 3" }} />
      <Atis
        sx={{
          ...gridItemSx,
          gridColumnEnd: "span 2",
          padding: 0,
        }}
      />
      <Flex
        sx={{
          flexDirection: "column",
          overflow: "auto",
          ...gridItemSx,
        }}
      >
        <ECFMP />
        <Events />
        <Agreements />
      </Flex>
      <Areas sx={gridItemSx} />
      <Flex
        sx={{
          flexDirection: "column",
          ...gridItemSx,
        }}
      >
        <SectorStatus />
        <SectorStaffing />
      </Flex>
      <ADinfo sx={{ ...gridItemSx, padding: 0 }} />
    </Grid>
  )
}

export { AtisAfw }
