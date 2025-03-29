import { useAppSelector } from "app/hooks"
import { api } from "services/api"
import { selectActiveAerodrome } from "services/idvsSlice"
import { usePollMetarByIcaoCodes } from "services/metarApi"
import { Box } from "theme-ui"

export const EDDF = () => {
  const aerodrome = useAppSelector(selectActiveAerodrome)
  usePollMetarByIcaoCodes([aerodrome])
  api.useAerodromesByIcaosQuery([aerodrome])

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: "2rem",
          left: "2vw",
          width: "40vw",
          height: "4rem",
          backgroundColor: "#666",
          display: "inline-flex",
          justifyContent: "flex-end",
          alignItems: "center",
          color: "white",
          fontSize: "3.5rem",
        }}
      >
        25R &larr;
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "10rem",
          left: "14vw",
          width: "4rem",
          height: "40vh",
          backgroundColor: "#666",
          display: "inline-flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          color: "white",
          fontSize: "3.5rem",
          textAlign: "center",
        }}
      >
        &darr; 18
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "15rem",
          left: "35vw",
          width: "55vw",
          height: "4rem",
          backgroundColor: "#666",
          display: "inline-flex",
          justifyContent: "flex-end",
          alignItems: "center",
          color: "white",
          fontSize: "3.5rem",
        }}
      >
        25C &larr;
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "27rem",
          left: "35vw",
          width: "55vw",
          height: "4rem",
          backgroundColor: "#666",
          display: "inline-flex",
          justifyContent: "flex-end",
          alignItems: "center",
          color: "white",
          fontSize: "3.5rem",
        }}
      >
        25L &larr;
      </Box>
    </>
  )
}
