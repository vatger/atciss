import { useAppDispatch, useAppSelector } from "app/hooks"
import { windLevelLabel } from "app/isa"
import { useId } from "react"
import { WIND_LEVELS, selectWindLevel, setWindLevel } from "services/mapSlice"
import { Grid, Label, Slider } from "theme-ui"

export const WindLevelChoice = () => {
  const dispatch = useAppDispatch()
  const windLevel = useAppSelector(selectWindLevel)
  const windLevelSliderId = useId()
  const index = WIND_LEVELS.indexOf(windLevel)

  return (
    <Grid
      sx={{
        width: "100%",
        gap: 2,
        pl: 4,
        gridTemplateColumns: "1fr 1fr 1fr",
        alignItems: "center",
      }}
    >
      <Slider
        id={windLevelSliderId}
        sx={{ display: "block", gridColumn: "span 2" }}
        min="0"
        max={WIND_LEVELS.length - 1}
        step="1"
        value={index}
        onChange={(e) =>
          dispatch(setWindLevel(WIND_LEVELS[parseInt(e.target.value)]))
        }
      />
      <Label sx={{ justifyContent: "flex-end" }}>
        {windLevelLabel(windLevel)}
      </Label>
    </Grid>
  )
}
