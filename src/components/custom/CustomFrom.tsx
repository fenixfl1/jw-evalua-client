import { Form, FormProps } from 'antd'
import React from 'react'

export const validateMessages = {
  required: '${label} es requerido.',
  types: {
    email: '${label} no es un email válido.',
    number: '${label} no es un número válido.',
    regexp: '${label} formato no válido.',
  },
  pattern: {
    mismatch: '${label} formato no válido.',
  },
  number: {
    len: '"${label}" debe tener exactamente "${len}" caracteres.',
    min: '"${label}" debe ser mayor o igual a "${min}".',
    range: "'${label}' debe estar entre ${min} y ${max}",
  },
  string: {
    len: '"${label}" debe tener exactamente "${len}" caracteres.',
    range: "'${label}' debe tener entre ${min} y ${max} dígitos",
    min: '"${label}" debe tener mínimo "${len}" caracteres',
  },
  min: '"${label}" debe tener mínimo "${len}" caracteres.',
}

interface CustomFormProps extends FormProps {
  children: React.ReactNode | React.ReactNode[]
}

const CustomForm: React.FC<CustomFormProps> = ({
  autoComplete = 'off',
  name = 'custom-form',
  ...props
}) => {
  return (
    <Form
      autoComplete={autoComplete}
      name={name}
      validateMessages={validateMessages}
      {...props}
    >
      {props.children}
    </Form>
  )
}

export default CustomForm
