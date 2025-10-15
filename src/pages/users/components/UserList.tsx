import { DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { ListProps } from 'antd'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import CustomAvatar from 'src/components/custom/CustomAvatar'
import CustomButton from 'src/components/custom/CustomButton'
import CustomDivider from 'src/components/custom/CustomDivider'
import CustomList from 'src/components/custom/CustomList'
import CustomListItem from 'src/components/custom/CustomListItem'
import CustomListItemMeta from 'src/components/custom/CustomListItemMeta'
import { CustomLink, CustomText } from 'src/components/custom/CustomParagraph'
import CustomSpace from 'src/components/custom/CustomSpace'
import { ColumnsMap } from 'src/components/custom/CustomTable'
import CustomTag from 'src/components/custom/CustomTag'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { DISABLED_COLOR } from 'src/constants/colors'
import { User } from 'src/services/users/users.types'
import { useUserStore } from 'src/store/user.store'
import formatter from 'src/utils/formatter'
import { getAvatarLink } from 'src/utils/get-avatar-link'
import { getTablePagination } from 'src/utils/table-pagination'

interface UserListProps {
  onUpdate?: (user: User) => void
}

const UserList: React.FC<UserListProps> = ({ onUpdate }) => {
  const [, setSearchParam] = useSearchParams()
  const { userList, metadata } = useUserStore()

  const columnsMap: ColumnsMap<User> = {
    USER_ID: 'Código',
    USERNAME: {
      header: 'Usuario',
      render: (value) => `@${value}`,
    },
    NAME: 'Nombre',
    LAST_NAME: 'Apellido',
    EMAIL: 'Correo',
    PHONE: {
      header: 'Teléfono',
      render: (value: string) => formatter({ value, format: 'phone' }),
    },
    ROLES: 'Rol',
    CREATED_AT: 'F.Registro',
    CREATED_BY: 'Creado por',
    STATE: {
      header: 'Estado',
      render: (value) => {
        const state = typeof value === 'string' ? value : ''
        return state === 'A' ? 'Activo' : 'Inactivo'
      },
    },
  }

  const renderItem: ListProps<User>['renderItem'] = (item) => (
    <CustomListItem
      actions={[
        <CustomTooltip title={item.STATE === 'A' ? 'Inhabilitar' : 'Habilitar'}>
          <CustomButton
            onClick={() => onUpdate(item)}
            size={'large'}
            danger={item.STATE === 'A'}
            type={'link'}
            icon={
              item.STATE === 'A' ? (
                <DeleteOutlined />
              ) : (
                <StopOutlined style={{ color: DISABLED_COLOR }} />
              )
            }
          />
        </CustomTooltip>,
      ]}
    >
      <CustomListItemMeta
        avatar={<CustomAvatar size={44} src={getAvatarLink(item)} />}
        title={
          <CustomText disabled={item.STATE === 'I'}>
            <CustomLink
              disabled={item.STATE === 'I'}
              delete={item.STATE === 'I'}
              onClick={() => setSearchParam({ username: item.USERNAME })}
            >{`${item.NAME} ${item.LAST_NAME}`}</CustomLink>
          </CustomText>
        }
        description={
          <CustomSpace
            direction={'horizontal'}
            split={item.ROLES ? <CustomDivider type={'vertical'} /> : undefined}
          >
            <CustomText
              style={{ fontSize: 12 }}
              disabled={item.STATE === 'I'}
              delete={item.STATE === 'I'}
            >
              @{item.USERNAME}
            </CustomText>
            <CustomSpace direction={'horizontal'}>
              {item.ROLES?.split(',').map((rol) => (
                <CustomTag>
                  <CustomText
                    style={{ fontSize: 12 }}
                    disabled={item.STATE === 'I'}
                    delete={item.STATE === 'I'}
                  >
                    {rol}
                  </CustomText>
                </CustomTag>
              ))}
            </CustomSpace>
          </CustomSpace>
        }
      />
    </CustomListItem>
  )

  return (
    <CustomList
      columnsMap={columnsMap}
      exportOptions={{ title: 'Lista de usuarios', orientation: 'landscape' }}
      dataSource={userList}
      renderItem={renderItem}
      pagination={getTablePagination(metadata)}
    />
  )
}

export default UserList
