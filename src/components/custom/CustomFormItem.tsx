import React from 'react'
import { Form, FormItemProps } from 'antd'
import { RuleRender } from 'antd/lib/form'
import { useFormContext } from 'src/context/FormContext'
import { CustomFormItemProvider } from 'src/context/FormItemContext'

const { Item } = Form

interface CustomFormItemProps extends FormItemProps {
  noSpaces?: boolean
  match?: RegExp
  matchMessage?: string
  uppercase?: boolean
  readonly?: boolean
}

const CustomFormItem: React.FC<CustomFormItemProps> = ({
  required,
  noSpaces = false,
  match,
  validateTrigger,
  rules = [],
  uppercase = false,
  matchMessage = 'Formato no valido',
  readonly,
  ...props
}) => {
  const ctx = useFormContext()
  const updatedRules = [...rules]

  const normalize = (value: string) => {
    if (typeof value !== 'string') return value

    if (noSpaces && /\s/.test(value)) {
      return value.replace(/\s/g, '')
    }

    if (uppercase) {
      return value?.toUpperCase()
    }

    return value
  }

  const matchValidator: RuleRender = () => ({
    validator: (_, value: string) => {
      if (!value || value?.match(match)) {
        return Promise.resolve()
      }

      return Promise.reject(new Error(matchMessage))
    },
  })

  if (match) {
    validateTrigger = 'onBlur'
    updatedRules.push(matchValidator)
  }

  return (
    <CustomFormItemProvider
      value={{
        readonly: readonly ?? ctx?.readonly,
        required,
        noSpaces,
        match,
        validateTrigger,
        rules,
        uppercase,
        matchMessage,
        ...props,
      }}
    >
      <Item
        validateTrigger={validateTrigger}
        required={required}
        {...props}
        normalize={noSpaces || uppercase ? normalize : props.normalize}
        rules={updatedRules}
      >
        {props.children}
      </Item>
    </CustomFormItemProvider>
  )
}

export default CustomFormItem
