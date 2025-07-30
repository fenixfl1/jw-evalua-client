import React from 'react'
import { List, ListProps } from 'antd'

interface CustomListProps<T> extends ListProps<T> {
  pageSizeOptions?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomList: React.FC<CustomListProps<any>> = ({
  size = 'small',
  itemLayout = 'horizontal',
  pageSizeOptions = ['5', '10', '20', '50', '100'],
  ...props
}) => {
  return (
    <List
      itemLayout={itemLayout}
      pagination={{ pageSizeOptions, ...props.pagination }}
      size={size}
      {...props}
    />
  )
}

export default CustomList
