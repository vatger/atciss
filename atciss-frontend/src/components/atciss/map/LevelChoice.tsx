import { useAppDispatch, useAppSelector } from "app/hooks"
import { useId } from "react"
import { selectLevel, setLevel } from "services/mapSlice"
import { Grid, Input, Label, Slider } from "theme-ui"

export const LevelChoice = () => {
  const dispatch = useAppDispatch()
  const level = useAppSelector(selectLevel)
  const levelSliderId = useId()

  return (
    <Grid
      sx={{
        flex: "none",
        gap: 3,
        gridAutoFlow: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Label sx={{ fontWeight: "bold" }} htmlFor={levelSliderId}>
        Level
      </Label>
      <Slider
        id={levelSliderId}
        sx={{ display: "block" }}
        min="0"
        max="430"
        step="10"
        value={level}
        onChange={(e) => dispatch(setLevel(parseInt(e.target.value)))}
      />
      <Input
        type="number"
        min="0"
        max="430"
        step="10"
        value={level}
        onChange={(e) => dispatch(setLevel(parseInt(e.target.value)))}
      />
    </Grid>
  )
}
