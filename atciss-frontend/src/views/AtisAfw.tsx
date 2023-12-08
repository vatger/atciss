import { Flex, Grid, ThemeUIStyleObject } from "theme-ui"
import { Atis } from "../components/Atis"
import { ADinfo } from "../components/ADInfo"
import { ECFMP } from "../components/ECFMP"
import { Events } from "../components/Events"
import { Areas } from "../components/Areas"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { selectActiveFir } from "../services/configSlice"
import { SecondaryNavButton } from "../components/NavButton"
import {
  selectPageNames,
  selectActivePageName,
  setActivePage,
} from "../services/atisAfwSlice"
import { SectorStaffing } from "../components/SectorStaffing"

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
      </Flex>
      <Areas sx={gridItemSx} />
      <SectorStaffing sx={gridItemSx} />
      <ADinfo sx={{ ...gridItemSx, padding: 0 }} />
    </Grid>
  )
}

export { AtisAfw }
