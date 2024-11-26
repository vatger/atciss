import { ReactElement } from "react"
import { Flex, Text } from "theme-ui"

interface AcInfoBoxProps {
  item: string | ReactElement
  value: string
  backgroundColor: string
  textColor: string
  link?: string
}

export const AircraftInfoBit = (props: AcInfoBoxProps) => (
  <Flex
    sx={{
      backgroundColor: props.backgroundColor,
      color: props.textColor,
      flexDirection: "column",
      alignItems: "center",
      padding: 2,
      cursor: props.link ? "pointer" : "default",
    }}
    onClick={() => {
      if (props.link) {
        window.open(
          props.link,
          "atciss-ac-info",
          "toolbar=no, location=no, directories=no, status=no, menubar=no",
        )
      }
    }}
  >
    <Text sx={{ fontSize: "0.9rem", height: "1.3rem" }}>{props.item}</Text>
    <Text
      sx={{ fontSize: "1.8rem", fontFamily: "monospace", fontWeight: "bold" }}
    >
      {props.value}
    </Text>
  </Flex>
)
