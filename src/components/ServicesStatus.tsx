import React from 'react'
import CustomList from './custom/CustomList'
import { ListProps } from 'antd'
import CustomListItem from './custom/CustomListItem'
import CustomButton from './custom/CustomButton'
import CustomTag from './custom/CustomTag'
import { ReloadOutlined, StopOutlined } from '@ant-design/icons'
import CustomSpace from './custom/CustomSpace'
import { CustomText, CustomTitle } from './custom/CustomParagraph'
import CustomCard from './custom/CustomCard'
import CustomDivider from './custom/CustomDivider'
import capitalize from 'src/utils/capitalize'

const statusColor = {
  ONLINE: '#1668dc',
  STOPPED: '#a61d24',
}

const ServicesStatus: React.FC = () => {
  const dataSource = [
    {
      name: 'client',
      status: 'STOPPED',
    },
    {
      name: 'CORETS',
      status: 'ONLINE',
    },
    {
      name: 'FBAdmin',
      status: 'ONLINE',
    },
  ]

  const renderItem: ListProps<Record<string, string>>['renderItem'] = (
    item
  ) => {
    return (
      <CustomListItem
        actions={[
          <CustomButton type={'link'} icon={<ReloadOutlined />}>
            Reiniciar
          </CustomButton>,
          <CustomButton type={'link'} danger icon={<StopOutlined />}>
            Detener
          </CustomButton>,
        ]}
      >
        <CustomSpace direction={'horizontal'} size={5} wrap>
          <CustomText>{capitalize(item.name)}</CustomText>
          <CustomText type={'secondary'}>
            <CustomTag color={statusColor[item.status]}>
              {item.status}
            </CustomTag>
          </CustomText>
        </CustomSpace>
      </CustomListItem>
    )
  }
  return (
    <CustomCard style={{ height: '100%' }} width={'100%'}>
      <CustomSpace>
        <CustomDivider>
          <CustomTitle level={4}>PM2 Status</CustomTitle>
        </CustomDivider>
        <CustomList
          size={'large'}
          pagination={false}
          bordered={false}
          dataSource={dataSource}
          renderItem={renderItem}
        />
      </CustomSpace>
    </CustomCard>
  )
}

export default ServicesStatus
