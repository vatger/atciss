import { useAppDispatch, useAppSelector } from "app/hooks"
import { XmButton } from "components/atciss/XmButton"
import { XmInput } from "components/atciss/XmInput"
import { AerodromeSelect } from "components/idvs/AerodromeSelect"
import { RunwaySetupDialog } from "components/idvs/RunwaySetupDialog"
import { DateTime } from "luxon"
import { ReactNode } from "react"
import { selectActiveAerodrome, setAtisRwyConfigOpen } from "services/idvsSlice"
import { selectMetar, usePollMetarByIcaoCodes } from "services/metarApi"
import { Box, Flex, Input, ThemeUIStyleObject } from "theme-ui"

const AtisLine = ({
  children,
  label,
  height = 0,
  sx,
}: {
  children: ReactNode
  label: string
  height?: number
  sx?: ThemeUIStyleObject
}) => (
  <Flex
    sx={{
      gap: 2,
      width: "100%",
      flexGrow: height,
      ...sx,
    }}
  >
    <Box sx={{ textAlign: "right", pt: 1, flex: "0 6rem" }}>{label}</Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Flex>
)

export const Atis = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  const dispatch = useAppDispatch()
  const metar = useAppSelector((store) =>
    selectMetar(store, aerodrome),
  )?.current

  const obs_time = metar?.time
    ? DateTime.fromISO(metar?.time, { zone: "UTC" }).toFormat("ddHHmm")
    : "?"

  const raw_metar = metar?.raw
    ? metar?.raw.replace(/^\S{4} \d{6}Z (AUTO )?/, "")
    : "?"

  console.log(metar)

  return (
    <>
      <RunwaySetupDialog />
      <Flex
        sx={{
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          gap: 2,
        }}
      >
        <AtisLine label={""}>
          <AerodromeSelect sx={{ width: "10rem" }} />
        </AtisLine>
        <AtisLine label={"Obs. Time"}>
          <Input
            variant={"xm_xl"}
            sx={{ width: "10rem" }}
            readOnly={true}
            value={obs_time}
          ></Input>
        </AtisLine>
        <AtisLine label={"Info 1"}>
          <XmInput value={"asdf"}></XmInput>
        </AtisLine>
        <AtisLine label={"RWY in Use"}>
          <XmButton
            onClick={() => {
              dispatch(setAtisRwyConfigOpen(true))
            }}
          >
            Set up
          </XmButton>
        </AtisLine>
        <AtisLine label={"Info 2"} height={4}>
          hello
        </AtisLine>
        <AtisLine label={"TRL"}>
          <Input
            variant={"xm_xl"}
            readOnly={true}
            sx={{ width: "4rem" }}
            value={metar?.tl || ""}
          />
        </AtisLine>
        <AtisLine label={"Info 3"} height={3}>
          hello
        </AtisLine>
        <AtisLine label={"METAR"}>
          <Input variant={"xm_xl"} readOnly={true} value={raw_metar} />
        </AtisLine>
        <AtisLine label={"Info 4"} height={3}>
          hello
        </AtisLine>
      </Flex>
    </>
  )
}
