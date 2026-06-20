import { api } from "services/api"

export interface TaskStatus {
  name: string
  status: "success" | "error" | null
  finished_at: number | null
  execution_time: number | null
}

export interface WorkerStatus {
  queue_length: number
  redis_ok: boolean
  tasks: TaskStatus[]
}

export const usePollWorkerStatus: typeof api.useWorkerStatusQuery = (
  arg,
  options,
) => api.useWorkerStatusQuery(arg, { pollingInterval: 5000, ...options })
