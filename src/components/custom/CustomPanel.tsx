import { Collapse, CollapsePanelProps } from "antd"
import React from "react"
import styled from "styled-components"

const Title = styled.span`
  font-size: 12px;
  font-weight: bold;
`

const Panel = styled(Collapse.Panel)`
  border: none !important;
  background: ${({ theme }) => theme.backgroundColor} !important;
  border-radius: ${({ theme }) => theme.borderRadius} !important;
`

interface CustomCollapsePanelProps extends Omit<CollapsePanelProps, "header"> {
  title: string
}

const CustomPanel: React.FC<CustomCollapsePanelProps> = ({
  title,
  ...props
}) => {
  return (
    <Panel
      className={"ant-collapse-item"}
      header={<Title>{title}</Title>}
      {...props}
    />
  )
}

export default CustomPanel
