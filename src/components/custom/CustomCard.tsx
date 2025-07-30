import React from "react"
import { Card, CardProps } from "antd"
import styled from "styled-components"

export interface CustomCardProps extends CardProps {
  width?: number | string
  height?: number | string
  shadow?: boolean
  color?: string
}

const StyledCard = styled<React.FC<CustomCardProps>>(Card)`
  box-shadow: ${({ shadow, theme }) =>
    shadow ? theme.boxShadow : undefined} !important;
  background-color: ${({ color }) => color} !important;
`

const CustomCard: React.FC<CustomCardProps> = ({
  shadow,
  height,
  width,
  color,
  ...props
}) => {
  return (
    <StyledCard
      color={color}
      shadow={shadow}
      style={{ ...props.style, height, width }}
      {...props}
    >
      {props.children}
    </StyledCard>
  )
}

export default CustomCard
