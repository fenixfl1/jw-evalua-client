import React, { useState } from 'react'
import CustomTabs from './custom/CustomTabs'
import CustomSpace from './custom/CustomSpace'
import CustomRow from './custom/CustomRow'
import CustomAnchor from './custom/CustomAnchor'
import CustomCol from './custom/CustomCol'

const LogContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <CustomRow
      justify={'space-between'}
      align={'top'}
      style={{ position: 'relative' }}
    >
      <CustomCol xs={4} style={{ position: 'relative' }}>
        <CustomAnchor
          style={{ position: 'absolute', left: 0, top: 0 }}
          items={[
            {
              key: '1',
              href: '#anchor-demo-basic',
              title: '12/03/2025',
            },
            {
              key: '2',
              href: '#anchor-demo-static',
              title: '13/03/2025',
            },
            {
              key: '3',
              href: '#api-1',
              title: '15/03/2025',
            },
            {
              key: '4',
              href: '#api-2',
              title: '16/03/2025',
            },
            {
              key: '5',
              href: '#api-3',
              title: '17/03/2025',
            },
            {
              key: '6',
              href: '#api-4',
              title: '18/03/2025',
            },
            {
              key: '7',
              href: '#api-5',
              title: '19/03/2025',
            },
            {
              key: '8',
              href: '#api-6',
              title: '20/03/2025',
            },
            {
              key: '9-7',
              href: '#api',
              title: '21/03/2025',
            },
          ]}
        />
      </CustomCol>

      <CustomCol xs={20}>{children}</CustomCol>
    </CustomRow>
  )
}

const Logs: React.FC = () => {
  const [activeKey, setActiveKey] = useState('1')

  const items = [
    {
      label: 'Client',
      key: '1',
      children: <LogContent>Logs del cliente</LogContent>,
    },
    {
      label: 'CORETS',
      key: '2',
      children: <LogContent>Logs del CORETS</LogContent>,
    },
    {
      label: 'FBAdmin API',
      key: '3',
      children: <LogContent>Logs de la api FBAdmin</LogContent>,
    },
  ]

  return (
    <>
      <CustomSpace>
        <CustomTabs
          size={'large'}
          activeKey={activeKey}
          onChange={setActiveKey}
          defaultActiveKey={activeKey}
          type={'card'}
          items={items}
        />

        {/* <div>{items[activeKey].Children}</div> */}
      </CustomSpace>
    </>
  )
}

export default Logs
