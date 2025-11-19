import React, { useEffect } from 'react'
import styled from 'styled-components'
import CustomHeader from '../custom/CustomHeader'
import CustomRow from '../custom/CustomRow'
import CustomCol from '../custom/CustomCol'
import CustomSpace from '../custom/CustomSpace'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { CustomText, CustomTitle } from '../custom/CustomParagraph'
import capitalize from 'src/utils/capitalize'
import { getSessionInfo, removeSession } from 'src/lib/session'
import { getAvatarLink } from 'src/utils/get-avatar-link'
import { useSearchParams } from 'react-router-dom'
import CustomAvatar from '../custom/CustomAvatar'
import { useUserStore } from 'src/store/user.store'
import { useMenuOptionStore } from 'src/store/menu-options.store'
import ConditionalComponent from '../ConditionalComponent'
import UserProfile from '../Profile'
import CustomButton from '../custom/CustomButton'
import CustomTooltip from '../custom/CustomTooltip'
import { useCustomModal } from 'src/hooks/use-custom-modal'

const Header = styled(CustomHeader)<{ width: string | number }>`
  display: flex;
  align-items: center;
  height: 64px;
  width: ${({ width }) => width};
  border-radius: 8px !important;
  margin: 21px 24px 0 20px;
  padding: 0 35px !important;
`

interface MainHeaderProps {
  width?: string | number
  showLogout?: boolean
}

const MainHeader: React.FC<MainHeaderProps> = ({
  width = 'calc(100vw - 280px)',
  showLogout = false,
}) => {
  const { confirmModal } = useCustomModal()
  const [searchParams, setSearchParams] = useSearchParams()
  const { profileVisibilityState, setProfileVisibilitySate } = useUserStore()
  const { currenMenuOption, reset } = useMenuOptionStore()

  useEffect(() => {
    if (!profileVisibilityState && searchParams.get('username')) {
      setProfileVisibilitySate(true)
    }
  }, [profileVisibilityState, searchParams])

  const handleLogout = () => {
    confirmModal({
      title: 'Cerrar Sesión',
      content: 'Seguro que desea cerrar la sesión?',
      onOk: () => {
        removeSession()
        reset()
        window.location.reload()
      },
    })
  }

  return (
    <>
      <Header width={width}>
        <CustomRow
          justify={'space-between'}
          width={'100%'}
          height={'100%'}
          align={'middle'}
        >
          <ConditionalComponent
            condition={!showLogout}
            fallback={
              <CustomTooltip title={'Cerrar Sesión'} placement={'right'}>
                <CustomButton
                  size={'large'}
                  type={'text'}
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                />
              </CustomTooltip>
            }
          >
            <CustomCol xs={12}>
              <CustomTitle level={3} style={{ margin: 'auto', color: 'white' }}>
                {currenMenuOption?.DESCRIPTION}
              </CustomTitle>
            </CustomCol>
          </ConditionalComponent>
          <CustomSpace direction="horizontal" width={null}>
            <CustomAvatar
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setSearchParams({
                  username: getSessionInfo().username,
                })
                setProfileVisibilitySate(true)
              }}
              size={44}
              icon={<UserOutlined />}
              src={getAvatarLink()}
            />
            <CustomText strong style={{ color: '#ffffff' }}>
              {capitalize(
                getSessionInfo().name || getSessionInfo().username || ''
              )}
            </CustomText>
          </CustomSpace>
        </CustomRow>
      </Header>

      <ConditionalComponent condition={profileVisibilityState}>
        <UserProfile />
      </ConditionalComponent>
    </>
  )
}

export default MainHeader
