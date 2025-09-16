import React from 'react'
import CustomSelect, { CustomSelectProps } from './custom/CustomSelect'

const defaultOptions = [
  { label: 'Activo', value: 'A' },
  { label: 'Inactivos', value: 'I' },
]

const StateSelector: React.FC<CustomSelectProps> = ({
  mode = 'multiple',
  options = defaultOptions,
  ...props
}) => {
  return (
    <CustomSelect
      mode={mode}
      placeholder={'Seleccionar estados'}
      options={options}
      {...props}
    />
  )
}

export default StateSelector
