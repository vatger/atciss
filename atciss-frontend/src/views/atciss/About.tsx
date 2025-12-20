/** @jsxImportSource theme-ui */

import { Box } from "theme-ui"

export const About = () => {
  return (
    <Box
      sx={{
        width: "40rem",
        margin: "auto",
        textAlign: "center",
      }}
    >
      <h1>ATCISS</h1>
      <p>Brought to you with &lt;3 by Robin, Franz, and Alex.</p>
      <p>Software licensed under the terms of the MIT License.</p>

      <h3>Data Providers and Acknowledgements</h3>
      <p>
        Aeronautical Data provided by DFS Deutsche Flugsicherung GmbH with kind
        permission.
        <br />
        Data is not to be used for real-world navigation.
      </p>
      <p>
        NOTAMs provided with kind support from the Federal Aviation
        Administration of the United States of America.
      </p>
      <p>
        Additional Aeronautical Data by OpenAIP, licensed under the terms of the
        Creative Commons Attribution-NonCommercial 4.0 International License.
      </p>
      <p>
        Airspace mapping provided by the open flightmaps association with kind
        permission.
      </p>
      <p>Weather radar provided by Deutscher Wetterdienst DWD.</p>
      <p>
        Lightning maps provided by lightningmaps.org and blitzortung.org under
        the terms of the Creative Commons ShareAlike-Attribution 4.0 License.
      </p>
    </Box>
  )
}
