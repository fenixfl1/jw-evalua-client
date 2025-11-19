import { Form } from 'antd'
import React from 'react'
import { CustomFormProps, CustomFormProvider } from 'src/context/FormContext'

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

const CustomForm: React.FC<CustomFormProps> = ({
  autoComplete = 'off',
  name = 'custom-form',
  readonly = false,
  ...props
}) => {
  return (
    <CustomFormProvider
      value={{
        name,
        readonly,
        ...props,
      }}
    >
      <Form
        autoComplete={autoComplete}
        name={name}
        validateMessages={validateMessages}
        {...props}
      >
        {props.children}
      </Form>
    </CustomFormProvider>
  )
}

export default CustomForm
