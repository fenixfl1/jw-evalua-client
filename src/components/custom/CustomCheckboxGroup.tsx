import React from "react"
import { Checkbox } from "antd"
import { CheckboxGroupProps } from "antd/lib/checkbox"

const { Group } = Checkbox

const CustomCheckboxGroup = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupProps
>(({ ...props }, ref) => <Group ref={ref} {...props} />)

export default CustomCheckboxGroup
