import React, { cloneElement } from 'react'
import { AnyType, TriggersType } from 'src/types/general'
import { CustomModalWarning } from './custom/CustomModalMethods'

type Triggers = {
  [key in keyof TriggersType]: (e: AnyType) => void
}

interface ConditionalComponentProps extends Triggers {
  condition: boolean | undefined
  children: React.ReactNode
  visible?: boolean
  trigger?: keyof TriggersType
  message?: string
  fallback?: React.ReactNode
}

const ConditionalComponent: React.FC<ConditionalComponentProps> = ({
  condition,
  visible = false,
  trigger = 'onClick',
  message = 'No tienes autorización para ejecutar esta acción',
  fallback,
  ...props
}) => {
  const handleTrigger = (e: Event) => {
    e.preventDefault?.()
    if (condition) {
      if (React.isValidElement(props.children)) {
        props?.children?.props?.[trigger]?.(e)
      }
      ;(props as AnyType)?.[trigger]?.(e)
    } else if (visible && message) {
      CustomModalWarning({
        title: 'Aviso',
        content: message,
      })
    }
  }

  const element = condition
    ? cloneElement(props.children as AnyType, {
        [trigger]: handleTrigger,
      })
    : visible && !condition
    ? cloneElement(props.children as AnyType, {
        [trigger]: handleTrigger,
      })
    : fallback

  return element as React.ReactElement
}

export default ConditionalComponent
