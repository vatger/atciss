import { Box, Flex, Text } from "theme-ui"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectReadFiltered, setReadFiltered } from "../../services/notamSlice"

export const NotamControls = () => {
  const dispatch = useAppDispatch()

  const readFiltered = useAppSelector(selectReadFiltered)

  return (
    <Flex
      sx={{ flexDirection: "column", gap: 2, overflow: "hidden", padding: 2 }}
    >
      <Box>
        <Text as="label" variant="label">
          <input
            type="checkbox"
            checked={readFiltered}
            onChange={(e) => dispatch(setReadFiltered(e.target.checked))}
          />
          Filter NOTAMs marked as read
        </Text>
      </Box>
    </Flex>
  )
}
