/** @jsxImportSource theme-ui */

import { useState } from "react"
import { Button, Flex, Grid, Text } from "theme-ui"

export const ZoomableIframe = ({ src }: { src: string }) => {
  const [zoom, setZoom] = useState(1)

  return (
    <Grid sx={{ gridTemplate: "1fr / 1fr", width: "100%" }}>
      <iframe
        sx={{
          gridArea: "1 / 1",
          height: "100%",
          width: "100%",
          transformOrigin: "0 0",
          transform: `scale(${zoom})`,
        }}
        src={src}
      ></iframe>
      <Flex
        sx={{
          gridArea: "1 / 1",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          alignSelf: "baseline",
          mt: 2,
          zIndex: 2,
        }}
      >
        <Text
          onClick={() => setZoom(1)}
          sx={{ cursor: "pointer", color: "black" }}
        >
          🔎 {zoom.toFixed(2)}x
        </Text>
        <Button onClick={() => setZoom(zoom - 0.2)}>-</Button>
        <Button onClick={() => setZoom(zoom + 0.2)}>+</Button>
      </Flex>
    </Grid>
  )
}
