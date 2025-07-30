import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ListProps } from 'antd'
import React from 'react'
import CustomAvatar from 'src/components/custom/CustomAvatar'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomLink } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import CustomTag from 'src/components/custom/CustomTag'
import { User } from 'src/services/users/users.types'
import { useUserStore } from 'src/store/user.store'
import { getTablePagination } from 'src/utils/table-pagination'

interface UserListProps {
  dataSource?: User[]
}

const UserList: React.FC<UserListProps> = () => {
  const { userList, metadata } = useUserStore()

  const renderItem: ListProps<User>['renderItem'] = (item) => (
    <CustomListItem
      actions={[
        <CustomButton type={'link'} icon={<EditOutlined />} />,
        <CustomButton danger type={'link'} icon={<DeleteOutlined />} />,
      ]}
    >
      <CustomListItemMeta
        avatar={<CustomAvatar size={44} src={item.AVATAR} />}
        title={<CustomLink>{`${item.NAME} ${item.LAST_NAME}`}</CustomLink>}
        description={
          <CustomSpace
            direction={'horizontal'}
            split={item.ROLES ? <CustomDivider type={'vertical'} /> : undefined}
          >
            <span>@{item.USERNAME}</span>
            <CustomSpace direction={'horizontal'}>
              {item.ROLES?.split(',').map((rol) => (
                <CustomTag>{rol}</CustomTag>
              ))}
            </CustomSpace>
          </CustomSpace>
        }
      />
    </CustomListItem>
  )

  return (
    <CustomList
      dataSource={userList}
      renderItem={renderItem}
      pagination={getTablePagination(metadata)}
    />
  )
}

export default UserList
