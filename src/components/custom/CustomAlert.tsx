import React from 'react'
import { Alert } from 'antd'
import type { AlertProps } from 'antd/lib/alert'
import ConditionalComponent from '../ConditionalComponent'

type CustomAlertProps = Omit<AlertProps, 'message'> & {
  message: string | React.ReactNode
  children?: React.ReactNode
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message, ...props }) => (
  <Alert
    message={
      <ConditionalComponent
        condition={typeof message === 'string'}
        fallback={message}
      >
        <div dangerouslySetInnerHTML={{ __html: message as string }} />
      </ConditionalComponent>
    }
    {...props}
  />
)

export default CustomAlert
