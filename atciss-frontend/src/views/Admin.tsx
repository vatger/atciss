import { useEffect, useState } from "react"
import { Box, Button, Flex } from "theme-ui"
import { LOCAL_STORAGE_JWT_KEY } from "../app/auth/slice"

export const Admin = () => {
  const [tasks, setTasks] = useState<string[]>([])
  const token = localStorage.getItem(LOCAL_STORAGE_JWT_KEY)

  const runTask = (name: string) => async () =>
    await fetch(`/api/admin/task/${name}`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
    })

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch(`/api/admin/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(await response.json())
    }

    fetchTasks()
  }, [])

  return (
    <Box>
      <Flex
        sx={{
          width: "100%",
          gap: 2,
          mt: 4,
          flexWrap: "wrap",
        }}
      >
        {tasks.map((name) => (
          <Button key={name} onClick={runTask(name)}>
            {name}
          </Button>
        ))}
      </Flex>
    </Box>
  )
}
