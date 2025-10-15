import { EditOutlined, UploadOutlined } from '@ant-design/icons'
import { Form, DescriptionsProps, CollapseProps, App } from 'antd'
import { useState, useCallback } from 'react'
import { getSessionInfo } from 'src/lib/session'
import { logDate } from 'src/utils/date-utils'
import formatter from 'src/utils/formatter'
import styled from 'styled-components'
import ConditionalComponent from './ConditionalComponent'
import CustomAvatar from './custom/CustomAvatar'
import CustomButton from './custom/CustomButton'
import CustomCard from './custom/CustomCard'
import CustomCol from './custom/CustomCol'
import CustomCollapse from './custom/CustomCollapse'
import CustomDescriptions from './custom/CustomDescription'
import CustomDrawer from './custom/CustomDrawer'
import { CustomText } from './custom/CustomParagraph'
import CustomRow from './custom/CustomRow'
import CustomSpace from './custom/CustomSpace'
import CustomTag from './custom/CustomTag'
import CustomTooltip from './custom/CustomTooltip'
import ChangePasswordForm from './ChangePasswordForm'
import ChangeProfilePicForm from './ChangeProfilePicForm'
import { useSearchParams } from 'react-router-dom'
import sleep from 'src/utils/sleep'
import { getAvatarLink } from 'src/utils/get-avatar-link'
import CustomSpin from './custom/CustomSpin'
import { useChangePasswordMutation } from 'src/services/users/useChangePasswordMutation'
import { useUpdateUserMutation } from 'src/services/users/useUpdateUserMutation'
import { getBase64 } from 'src/utils/base64-helpers'
import queryClient from 'src/lib/query-client'
import { useErrorHandler } from 'src/hooks/use-error-handler'
import { useGetUserQuery } from 'src/services/users/useGetUserQuery'
import { useUserStore } from 'src/store/user.store'
import { useAppContext } from 'src/context/AppContext'

const states: Record<string, { label: string; color: string }> = {
  A: { label: 'Activo', color: 'green' },
  I: { label: 'Inactivo', color: 'gray' },
  P: { label: 'Pendiente', color: 'blue' },
}

const AvatarContainer = styled(CustomCard)<{ isDark: boolean }>`
  height: 150px;
  min-height: 150px;
  width: 100% !important;
  background-color: ${({ theme }) => theme.baseBgColor} !important;
  background-image: url('/assets/profile-background.avif') !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;

  .ant-typography {
    color: ${({ isDark }) => (isDark ? '#333' : undefined)};
  }

  .ant-typography-secondary {
    color: ${({ isDark }) => (isDark ? 'rgba(157, 159, 160, .8)' : undefined)};
  }

  .button-container {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 10px;
  }
`

const UserProfile: React.FC = () => {
  const { notification } = App.useApp()
  const [errorHandler] = useErrorHandler()
  const [form] = Form.useForm()
  const file = Form.useWatch('AVATAR_FILE', form)
  const [changePasswordModal, setChangePasswordModal] = useState(false)
  const [showChangeProfileOptions, setShowChangeProfileOptions] =
    useState(false)
  const { user, setUser, profileVisibilityState, setProfileVisibilitySate } =
    useUserStore()
  const { theme } = useAppContext()

  const { mutateAsync: changePassword, isPending: changePasswordIsPending } =
    useChangePasswordMutation()
  const { mutateAsync: updateUser, isPending: isUpdateUserPending } =
    useUpdateUserMutation()

  const [searchParams, setSearchParams] = useSearchParams()

  useGetUserQuery(searchParams.get('username'))

  const handleModalState = () => {
    setShowChangeProfileOptions(!showChangeProfileOptions)
  }

  const isMyProfile = Number(getSessionInfo().userId) === user.USER_ID

  const handleChangePassword = async () => {
    try {
      const data = await form.validateFields()

      delete data.CONFIRM_PASSWORD

      await changePassword(data)

      notification.success({
        type: 'success',
        message: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido actualizada con éxito',
      })
      form.resetFields()
      setChangePasswordModal(false)
    } catch (error) {
      errorHandler(error)
    }
  }

  const handleUpdateUser = useCallback(async () => {
    try {
      const data = await form.validateFields()
      if (!Object.keys(data).length) return

      let url = data.AVATAR_URL

      if (file) {
        url = await getBase64(file.fileList[0])
      }

      await updateUser({
        USER_ID: user.USER_ID,
        USERNAME: user.USERNAME,
        AVATAR: url,
      })

      queryClient.invalidateQueries({ queryKey: ['users', 'get-user'] })

      sessionStorage.setItem('avatar', url)
      form.resetFields()
      notification.success({
        message: 'Operación Exitosa',
        description: 'Foto de perfil actualizada con éxito.',
      })
      setShowChangeProfileOptions(false)
    } catch (error) {
      errorHandler(error)
    }
  }, [file, form])

  const personalInfoItems: DescriptionsProps['items'] = [
    {
      key: 'CREATED_AT',
      label: 'Fecha de registro',
      children: logDate(user.CREATED_AT),
      span: 2,
    },
    {
      key: 'user_id',
      label: 'Código',
      children: user.USER_ID,
    },
    {
      key: 'STATE',
      label: 'Estado',
      children: (
        <CustomTag color={states[user.STATE]?.color}>
          {states[user.STATE]?.label}
        </CustomTag>
      ),
    },
    {
      key: 'username',
      label: 'Usuario',
      children: `@${user.USERNAME}`,
    },
    {
      key: 'IDENTITY_DOCUMENT',
      label: 'Doc. Identidad',
      children: formatter({
        value: user.IDENTITY_DOCUMENT,
        format: 'document',
      }),
    },
    {
      key: 'PASSWORD',
      label: isMyProfile ? 'Contraseña' : '',
      children: (
        <ConditionalComponent condition={isMyProfile} fallback={' '}>
          <CustomSpace direction={'horizontal'} size={2}>
            <span>**********</span>
            <CustomTooltip title={'Cambiar contraseña'} placement={'right'}>
              <CustomButton
                type={'link'}
                icon={<EditOutlined />}
                onClick={() => setChangePasswordModal(true)}
              />
            </CustomTooltip>
          </CustomSpace>
        </ConditionalComponent>
      ),
    },
    {
      key: 'EMAIL',
      label: 'Correo electrónico',
      children: user.EMAIL,
    },
    {
      key: 'FIRST_NAME',
      label: 'Nombre',
      children: user.NAME,
    },
    {
      key: 'LAST_NAME',
      label: 'Apellido',
      children: user.LAST_NAME,
    },
    {
      key: 'PHONE',
      label: 'Teléfono',
      children: formatter({
        value: user.PHONE?.replace(/\D/g, ''),
        format: 'phone',
      }),
    },
    {
      key: 'BIRTHDAY',
      label: 'Fecha de nacimiento',
      children: logDate(user.BIRTH_DATE),
    },
    {
      key: 'GENDER',
      label: 'Género',
      children: user.GENDER === 'M' ? 'Masculino' : 'Femenino',
    },
    {
      key: 'ADDRESS',
      label: 'Dirección',
      children: user.ADDRESS,
      span: 2,
    },
    {
      key: 'ROLES',
      label: 'Rol',
      children: user?.ROLES?.split(',').map((rol) => (
        <CustomTag>{rol}</CustomTag>
      )),
    },
  ]

  const items: CollapseProps['items'] = [
    {
      key: 1,
      label: <CustomText strong>Información personal</CustomText>,
      children: <CustomDescriptions column={2} items={personalInfoItems} />,
    },
  ]

  return (
    <>
      <CustomDrawer
        closable={false}
        placement={'right'}
        width={'50%'}
        open={profileVisibilityState}
        onClose={async () => {
          setSearchParams()
          await sleep(500)
          setUser({} as never)
          setProfileVisibilitySate(false)
        }}
      >
        <CustomSpin spinning={isUpdateUserPending}>
          <CustomRow width={'100%'} gap={10}>
            <AvatarContainer isDark={theme === 'dark'}>
              <CustomRow gap={10} justify={'start'} align={'middle'}>
                <CustomAvatar
                  shape={'square'}
                  shadow
                  size={100}
                  src={getAvatarLink(user)}
                />
                <CustomSpace width={'max-content'} size={2}>
                  <CustomText strong>
                    {user?.NAME} {user?.LAST_NAME}
                  </CustomText>
                  <CustomText type={'secondary'}>@{user?.USERNAME}</CustomText>
                </CustomSpace>
              </CustomRow>
              <ConditionalComponent condition={isMyProfile}>
                <CustomTooltip
                  title={'Cambiar foto de perfil'}
                  placement={'left'}
                >
                  <div className={'button-container'}>
                    <CustomButton
                      size={'middle'}
                      icon={<UploadOutlined />}
                      onClick={handleModalState}
                    />
                  </div>
                </CustomTooltip>
              </ConditionalComponent>
            </AvatarContainer>
            <CustomCol xs={24}>
              <CustomCollapse
                collapsible={'disabled'}
                defaultActiveKey={[1, 2, 3]}
                items={items}
              />
            </CustomCol>
          </CustomRow>
        </CustomSpin>
      </CustomDrawer>

      <ConditionalComponent condition={changePasswordModal}>
        <ChangePasswordForm
          onFinish={handleChangePassword}
          open={changePasswordModal}
          onClose={() => setChangePasswordModal(false)}
          form={form}
          loading={changePasswordIsPending}
        />
      </ConditionalComponent>

      <ConditionalComponent condition={showChangeProfileOptions}>
        <ChangeProfilePicForm
          open={showChangeProfileOptions}
          onClose={handleModalState}
          onFinish={handleUpdateUser}
          form={form}
        />
      </ConditionalComponent>
    </>
  )
}

export default UserProfile
