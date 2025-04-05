import { useAppDispatch, useAppSelector } from "app/hooks"
import { SidebarLayout } from "components/SidebarLayout"
import { api } from "services/api"
import { selectActiveFir } from "services/configSlice"
import {
  selectLoaDocs,
  selectOpenDocument,
  setOpenDocument,
} from "services/loaDocsSlice"
import { Text, Badge, Box, Card, Flex, ThemeUIStyleObject } from "theme-ui"
import { LoaDoc } from "types/loa"
import { Cycle } from "airac-cc"
import { LoaControls } from "components/atciss/LoaControls"

const Doc = ({ doc }: { doc: LoaDoc }) => {
  const dispatch = useAppDispatch()
  const openDoc = useAppSelector(selectOpenDocument)
  const myDoc = `${doc.filename}?airac=${doc.airac}`
  const currentAirac = Cycle.fromDate(new Date())

  return (
    <Card
      sx={{
        backgroundColor: openDoc == myDoc ? "secondary" : "",
        cursor: "pointer",
        marginBottom: 2,
        borderBottom: "0px solid #333",
        padding: 1,
      }}
      onClick={() => {
        dispatch(setOpenDocument(myDoc))
      }}
    >
      <strong>{doc.name}</strong>
      <br />
      <Flex sx={{ justifyContent: "space-between" }}>
        <Box>
          {doc.firs.map((fir) => (
            <Badge key={fir} sx={{ marginRight: 1 }}>
              {fir}
            </Badge>
          ))}
        </Box>
        <Box>
          <Badge
            sx={{ marginRight: 1 }}
            variant={
              currentAirac.identifier == doc.airac.toString()
                ? "fresh"
                : "primary"
            }
          >
            {doc.airac}
          </Badge>
          <Text sx={{ fontSize: 1 }}>{doc.effective_date}</Text>
        </Box>
      </Flex>
    </Card>
  )
}

export const LOADoc = ({ sx }: { sx?: ThemeUIStyleObject }) => {
  const fir = useAppSelector(selectActiveFir)
  api.useLoaDocsByFirQuery(fir)
  const loaDocs = useAppSelector(selectLoaDocs)
  const doc = useAppSelector(selectOpenDocument)

  return (
    <SidebarLayout sx={{ overflowY: "hidden", ...sx }}>
      <Box>
        {doc && (
          <object
            data={`/static/loa/${doc}`}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            <p>
              You don&apos;t have a PDF plugin, but you can
              <a href={`/static/loa/${doc}`}>download the PDF file.</a>
            </p>
          </object>
        )}
      </Box>
      <Flex
        sx={{
          flexDirection: "column",
          overflowY: "scroll",
          gap: 2,
          padding: 2,
        }}
      >
        <LoaControls />
        <Box>
          {loaDocs.map((doc) => (
            <Doc key={doc.filename} doc={doc} />
          ))}
        </Box>
      </Flex>
    </SidebarLayout>
  )
}
