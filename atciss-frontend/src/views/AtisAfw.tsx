import { Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { selectActiveFir } from "../services/configSlice"
import { SecondaryNavButton } from "../components/NavButton"
import {
  selectPageNames,
  selectActivePageName,
  setActivePage,
} from "../services/atisAfwSlice"
import { Atis } from "../components/atis-afw/Atis"
import { ECFMP } from "../components/atis-afw/ECFMP"
import { Areas } from "../components/atis-afw/Areas"
import { ADinfo } from "../components/atis-afw/ADInfo"
import { Events } from "../components/atis-afw/Events"
import { Agreements } from "../components/atis-afw/Agreements"
import { SectorStatus } from "../components/atis-afw/SectorStatus"
import { SectorStaffing } from "../components/atis-afw/SectorStaffing"

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
          <SecondaryNavButton
            onClick={() => {
              dispatch(setActivePage({ fir, page }))
            }}
            key={page}
            active={page === activePage}
          >
            {page}
          </SecondaryNavButton>
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
