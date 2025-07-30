import React from 'react'
import { RefSelectProps, Select, SelectProps } from 'antd'

interface CustomSelectProps extends SelectProps {
  width?: string | number
  ref?: React.RefObject<RefSelectProps>
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  optionLabelProp = 'label',
  showSearch = true,
  width,
  ...props
}) => {
  return (
    <Select
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
