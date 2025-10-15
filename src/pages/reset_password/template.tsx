import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('assets/main-background.webp');
  background-repeat: no-repeat;
  background-size: cover;
`

const template: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Container>{children}</Container>
}

export default template
