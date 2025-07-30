// src/context/NotificationProvider.tsx
import React, { createContext, useContext } from 'react'
import { notification } from 'antd'
import type { NotificationArgsProps } from 'antd'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

interface NotificationContextType {
  notify: (config: NotificationArgsProps, type?: NotificationType) => void
  contextHolder: React.ReactNode
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export const useAppNotification = () => {
  const context = useContext(NotificationContext)
  if (!context)
    throw new Error(
      'useAppNotification must be used within a NotificationProvider'
    )
  return context.notify
}

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [api, contextHolder] = notification.useNotification()

  const notify = (
    config: NotificationArgsProps,
    type: NotificationType = 'success'
  ) => {
    api[type](config)
  }

  return (
    <NotificationContext.Provider value={{ notify, contextHolder }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  )
}
