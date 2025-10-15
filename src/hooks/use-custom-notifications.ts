import { App } from 'antd'
import { ArgsProps } from 'antd/lib/notification'
import { useCallback } from 'react'

export function useCustomNotifications() {
  const { notification } = App.useApp()

  const successNotification = useCallback((props: ArgsProps) => {
    notification.success({ ...props })
  }, [])

  const warningNotification = useCallback((props: ArgsProps) => {
    notification.warning({ ...props })
  }, [])

  const infoNotification = useCallback((props: ArgsProps) => {
    notification.info({ ...props })
  }, [])

  const errorNotification = useCallback((props: ArgsProps) => {
    notification.error({ ...props })
  }, [])

  return {
    successNotification,
    warningNotification,
    infoNotification,
    errorNotification,
  }
}
