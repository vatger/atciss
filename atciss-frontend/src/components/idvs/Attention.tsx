import { XmTextarea } from "components/atciss/XmTextarea"
import { Box, Flex } from "theme-ui"

export const Attention = () => {
  return (
    <Flex
      sx={{
        width: "100%",
        justifyContent: "space-between",
        pl: 2,
        gap: 3,
      }}
    >
      <Box sx={{ width: "3rem", pt: 1 }}>ATTN</Box>
      <XmTextarea
        sx={{
          backgroundColor: "primary",
          borderTop: "none",
          borderBottom: "none",
          resize: "none",
          fontFamily: "monospace",
        }}
      ></XmTextarea>
    </Flex>
  )
}
