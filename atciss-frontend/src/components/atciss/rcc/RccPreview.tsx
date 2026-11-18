/** @jsxImportSource theme-ui */

import { useState } from "react"
import { Box, Text } from "theme-ui"

export const RccPreview = ({ code }: { code: string | null }) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (!code) return
    void navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Box
      onClick={copyToClipboard}
      sx={{
        p: 3,
        textAlign: "center",
        borderStyle: "inset",
        cursor: code ? "pointer" : "default",
      }}
    >
      {code ? (
        <>
          <Text
            as="pre"
            sx={{
              fontFamily: "monospace",
              fontWeight: "bold",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              m: 0,
            }}
          >
            {code}
          </Text>
          <Text sx={{ fontSize: 0, mt: 2, display: "block" }}>
            {copied ? "Copied to clipboard!" : "Click to copy to clipboard"}
          </Text>
        </>
      ) : (
        <Text sx={{ color: "darkshadow" }}>No RCC generated yet.</Text>
      )}
    </Box>
  )
}
