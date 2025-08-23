import { MenuProps } from 'antd'
import React, { useMemo } from 'react'
import CustomContent from 'src/components/custom/CustomContent'
import CustomLayout from 'src/components/custom/CustomLayout'
import CustomMenu from 'src/components/custom/CustomMenu'
import CustomSider from 'src/components/custom/CustomSider'
import { useModuleStore } from 'src/store/module.store'
import styled from 'styled-components'

const Layout = styled(CustomLayout)`
  height: calc(100vh - 100px);
  border-radius: ${({ theme }) => theme.borderRadius} !important;
`

const Content = styled(CustomContent)`
  min-height: calc(100vh - 200px) !important;
  border-radius: ${({ theme }) => theme.borderRadius} !important;
  padding: 0 10px;
`

const Template: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { workModules } = useModuleStore()

  const items: MenuProps['items'] = useMemo(() => {
    return workModules.map((item) => ({
      key: item.MODULE_ID,
      label: item.DESCRIPTION,
    }))
  }, [workModules])

  return (
    <Layout hasSider>
      <CustomSider>
        <CustomMenu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['4']}
          items={items}
        />
      </CustomSider>
      <CustomLayout>
        <Content>{children}</Content>
      </CustomLayout>
    </Layout>
  )
}

export default Template
