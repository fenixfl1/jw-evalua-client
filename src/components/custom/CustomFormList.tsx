import React from "react"
import { Form } from "antd"
import { FormListProps } from "antd/lib/form"

const { List } = Form

const CustomFormList: React.FC<FormListProps> = ({ ...props }) => {
  return <List {...props}>{props.children}</List>
}

export default CustomFormList
