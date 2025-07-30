import React from "react"
import { Avatar, AvatarProps } from "antd"
import styled from "styled-components"

const SAvatar = styled(Avatar)<{ shadow?: string; backgroundColor?: string }>`
  box-shadow: ${({ shadow, theme }) => (shadow ? theme.boxShadow : "none")};
  background-color: ${({ backgroundColor, src }) =>
    Number(src?.toString().length) > 2
      ? backgroundColor
      : undefined} !important;
`

interface CustomAvatarProps extends AvatarProps {
  shadow?: boolean
  backgroundColor?: string
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  shadow = false,
  ...props
}) => {
  return <SAvatar shadow={shadow?.toString()} {...props} />
}

export default CustomAvatar
