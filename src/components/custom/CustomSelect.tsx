import React from 'react'
import { RefSelectProps, Select, SelectProps } from 'antd'
import { useFormContext } from 'src/context/FormContext'
import { useFormItemContext } from 'src/context/FormItemContext'

export interface CustomSelectProps extends SelectProps {
  width?: string | number
  ref?: React.RefObject<RefSelectProps>
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  optionLabelProp = 'label',
  showSearch = true,
  width,
  disabled,
  ...props
}) => {
  const context = useFormContext()
  const itemContext = useFormItemContext()

  return (
    <Select
      disabled={disabled ?? itemContext?.readonly ?? context?.readonly}
      showSearch={showSearch}
      optionLabelProp={optionLabelProp}
      filterOption={(input, option) =>
        Boolean(
          ((option?.label as string) ?? '')
            .toLowerCase()
            .includes(input.toLowerCase())
        )
      }
      style={{ ...props.style, width }}
      {...props}
    >
      {props.children}
    </Select>
  )
}

export default CustomSelect
