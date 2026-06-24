import { useAppDispatch, useAppSelector } from "app/hooks"
import { useId } from "react"
import { selectLevel, setLevel } from "services/mapSlice"
import { Grid, Slider } from "theme-ui"
import { XmInput } from "../XmInput"

export const LevelChoice = () => {
  const dispatch = useAppDispatch()
  const level = useAppSelector(selectLevel)
  const levelSliderId = useId()

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
        id={levelSliderId}
        sx={{ display: "block", gridColumn: "span 2" }}
        min="0"
        max="430"
        step="10"
        value={level}
        onChange={(e) => dispatch(setLevel(parseInt(e.target.value)))}
      />
      <XmInput
        type="number"
        min="0"
        max="430"
        step="10"
        value={level}
        onChange={(e) => dispatch(setLevel(parseInt(e.target.value)))}
        sx={{ textAlign: "right" }}
      />
    </Grid>
  )
}
