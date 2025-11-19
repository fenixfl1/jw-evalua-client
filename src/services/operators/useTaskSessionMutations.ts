import { useMutation } from '@tanstack/react-query'
import { API_PATH_OPERATOR_TASK_SESSION } from 'src/constants/routes'
import { postRequest } from '../api'

export type TaskSessionResponse = {
  sessionId: number
  startedAt: string
  endedAt?: string | null
  accumulatedSeconds: number
  isActive: boolean
}

type SessionPayload = {
  taskId: number
  timestamp?: string
  staffId?: number
}

const buildUrl = (taskId: number, action: string) =>
  `${API_PATH_OPERATOR_TASK_SESSION}/${taskId}/session/${action}`

export const useStartTaskSessionMutation = () =>
  useMutation<TaskSessionResponse, Error, SessionPayload>({
    mutationKey: ['operator', 'task-session', 'start'],
    mutationFn: async ({ taskId, timestamp, staffId }) => {
      const {
        data: { data },
      } = await postRequest<TaskSessionResponse>(buildUrl(taskId, 'start'), {
        timestamp,
        staffId,
      })
      if (!data) throw new Error('No se pudo iniciar la sesión.')
      return data
    },
  })

export const usePauseTaskSessionMutation = () =>
  useMutation<TaskSessionResponse, Error, SessionPayload>({
    mutationKey: ['operator', 'task-session', 'pause'],
    mutationFn: async ({ taskId, timestamp, staffId }) => {
      const {
        data: { data },
      } = await postRequest<TaskSessionResponse>(buildUrl(taskId, 'pause'), {
        timestamp,
        staffId,
      })
      if (!data) throw new Error('No se pudo pausar la sesión.')
      return data
    },
  })

export const useResumeTaskSessionMutation = () =>
  useMutation<TaskSessionResponse, Error, SessionPayload>({
    mutationKey: ['operator', 'task-session', 'resume'],
    mutationFn: async ({ taskId, timestamp, staffId }) => {
      const {
        data: { data },
      } = await postRequest<TaskSessionResponse>(buildUrl(taskId, 'resume'), {
        timestamp,
        staffId,
      })
      if (!data) throw new Error('No se pudo reanudar la sesión.')
      return data
    },
  })

export const useStopTaskSessionMutation = () =>
  useMutation<TaskSessionResponse, Error, SessionPayload>({
    mutationKey: ['operator', 'task-session', 'stop'],
    mutationFn: async ({ taskId, timestamp, staffId }) => {
      const {
        data: { data },
      } = await postRequest<TaskSessionResponse>(buildUrl(taskId, 'stop'), {
        timestamp,
        staffId,
      })
      if (!data) throw new Error('No se pudo finalizar la sesión.')
      return data
    },
  })
