import { useAppDispatch, useAppSelector } from "app/hooks"
import {
  selectInactiveFiltered,
  selectReadFiltered,
  setInactiveFiltered,
  setReadFiltered,
} from "services/notamSlice"
import { Box, Flex, Text } from "theme-ui"

export const NotamControls = () => {
  const dispatch = useAppDispatch()

  const inactiveFiltered = useAppSelector(selectInactiveFiltered)
  const readFiltered = useAppSelector(selectReadFiltered)

  return (
    <Flex
      sx={{ flexDirection: "column", gap: 2, overflow: "hidden", padding: 2 }}
    >
      <Box>
        <Text as="label" variant="label">
          <input
            type="checkbox"
            checked={inactiveFiltered}
            onChange={(e) => dispatch(setInactiveFiltered(e.target.checked))}
          />
          Filter inactive NOTAMs
        </Text>
      </Box>
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
