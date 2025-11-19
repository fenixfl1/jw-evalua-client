import { io, Socket } from 'socket.io-client'
import { BASE_API_PATH } from 'src/constants/routes'
import { getSessionToken } from './session'

let socket: Socket | null = null

export const getSocket = () => {
  if (socket) return socket

  const token = getSessionToken()

  socket = io(BASE_API_PATH || '', {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export type ProgressUpdateEvent = {
  type: 'completion' | 'reset'
  taskId: number
  goalId: number
  moduleId: number | null
  goalModuleId: number | null
  period: number | null
  totalForTask?: number
  timestamp: string
}
