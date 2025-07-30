import React from "react"
import { List } from "antd"
import { ListItemTypeProps } from "antd/lib/list/Item"

interface CustomListItemProps extends Partial<ListItemTypeProps> {
  children?: React.ReactNode
  actions?: React.ReactNode[]
  extra?: React.ReactNode
}

const { Item } = List

const CustomListItem: React.FC<CustomListItemProps> = ({ ...props }) => {
  return <Item {...props}>{props.children}</Item>
}

export default CustomListItem
