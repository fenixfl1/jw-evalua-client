import React from 'react'
import { Dropdown } from 'antd'
import { DropdownButtonProps } from 'antd/lib/dropdown'

const { Button } = Dropdown

const CustomDropdownButton: React.FC<DropdownButtonProps> = ({ ...props }) => {
  return <Button {...props}>{props.children}</Button>
}

export default CustomDropdownButton
