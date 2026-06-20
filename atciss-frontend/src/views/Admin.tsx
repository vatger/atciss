/** @jsxImportSource theme-ui */

import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { usePollWorkerStatus } from "services/adminApi"
import { Box, Button, Flex, Grid } from "theme-ui"
import { LOCAL_STORAGE_ACCESS_KEY } from "../app/auth/slice"

export const Admin = () => {
  const [tasks, setTasks] = useState<string[]>([])
  const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY)
  const { data: workerStatus } = usePollWorkerStatus()

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
    <Box sx={{ width: "100%", m: 2 }}>
      {workerStatus && (
        <Box sx={{ mt: 4 }}>
          <Flex sx={{ gap: 4, mb: 2 }}>
            <Box>Queue length: {workerStatus.queue_length}</Box>
            <Box>Redis: {workerStatus.redis_ok ? "ok" : "down"}</Box>
          </Flex>
          <table sx={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Last run</th>
                <th>Duration (s)</th>
              </tr>
            </thead>
            <tbody>
              {workerStatus.tasks.map((task) => (
                <tr key={task.name}>
                  <td>{task.name}</td>
                  <td>{task.status ?? "never run"}</td>
                  <td>
                    {task.finished_at
                      ? DateTime.fromSeconds(task.finished_at)
                          .toUTC()
                          .toFormat("y-MM-dd HH:mm")
                      : "-"}
                  </td>
                  <td>{task.execution_time?.toFixed(2) ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
      <Grid
        sx={{
          gap: 2,
          mt: 4,
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        }}
      >
        {tasks.map((name) => (
          <Button key={name} onClick={runTask(name)}>
            {name}
          </Button>
        ))}
      </Grid>
    </Box>
  )
}
