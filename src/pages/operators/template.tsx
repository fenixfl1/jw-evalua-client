import React from 'react'
import CustomContent from 'src/components/custom/CustomContent'
import CustomLayout from 'src/components/custom/CustomLayout'
import MainHeader from 'src/components/layout/MainHeader'
import ThemeTransitionLayout from 'src/components/ThemeTransition'
import styled from 'styled-components'

const Layout = styled(CustomLayout)`
  height: 100vh !important;
  width: 100vw;
  color: #333;
`

const BodyContainer = styled.div`
  min-height: calc(100vh - 85px);
  width: 100%;
  box-sizing: border-box !important;
`

const template: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Layout>
      <ThemeTransitionLayout>
        <MainHeader showLogout width={'calc(100vw - 40px)'} />
        <CustomContent style={{ padding: '0 55px' }}>
          <BodyContainer>{children}</BodyContainer>
        </CustomContent>
      </ThemeTransitionLayout>
    </Layout>
  )
}

export default template
