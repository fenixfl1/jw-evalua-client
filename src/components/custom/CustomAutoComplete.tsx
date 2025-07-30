import React from "react"
import { AutoComplete, AutoCompleteProps } from "antd"

const CustomAutocomplete: React.FC<AutoCompleteProps> = ({
  size = "small",
  allowClear = true,
  defaultActiveFirstOption = true,
  ...props
}) => {
  return (
    <AutoComplete
      allowClear={allowClear}
      size={size}
      defaultActiveFirstOption={defaultActiveFirstOption}
      {...props}
      filterOption={(input, option) =>
        Boolean(
          ((option?.label as string) ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        )
      }
    >
      {props.children}
    </AutoComplete>
  )
}

export default CustomAutocomplete
