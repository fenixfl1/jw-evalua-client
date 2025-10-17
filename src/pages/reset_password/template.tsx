import React from 'react'
import { useAppContext } from 'src/context/AppContext'
import styled from 'styled-components'

const Container = styled.div<{ isDark: boolean }>`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ isDark }) =>
    isDark
      ? '#333'
      : `radial-gradient(
    circle at 30% 30%,
    #ffe0ec,
    #e9f7ff 50%,
    #eaf7ef 100%
  )`};
`

const Template: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useAppContext()
  return <Container isDark={theme === 'dark'}>{children}</Container>
}

export default Template
