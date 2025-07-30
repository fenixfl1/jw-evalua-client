import React, { useEffect } from 'react'
import CustomSider from 'src/components/custom/CustomSider'
import CustomLayout from 'src/components/custom/CustomLayout'
import CustomHeader from 'src/components/custom/CustomHeader'
import CustomMenu from 'src/components/custom/CustomMenu'
import CustomContent from 'src/components/custom/CustomContent'
import CustomRow from 'src/components/custom/CustomRow'
import CustomAvatar from 'src/components/custom/CustomAvatar'
import styled from 'styled-components'
import { CustomText, CustomTitle } from 'src/components/custom/CustomParagraph'
import ConditionalComponent from 'src/components/ConditionalComponent'
import ThemeTransitionLayout from 'src/components/ThemeTransition'
import { useAppContext } from 'src/context/AppContext'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { getSessionInfo, removeSession } from 'src/lib/session'
import capitalize from 'src/utils/capitalize'
import CustomCol from 'src/components/custom/CustomCol'
import { useGetUserMenuOptionsQuery } from 'src/services/menu-options/useGetUserMenuOptionsQuery'
import { MenuOption } from 'src/services/menu-options/menu-options.types'
import SVGReader from 'src/components/SVGReader'
import { useNavigate, useParams } from 'react-router'
import { useMenuOptionStore } from 'src/store/menu-options.store'
import { findParentKeys } from 'src/utils/find-parent-keys'
import { MenuProps } from 'antd'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CustomButton from 'src/components/custom/CustomButton'
import { CustomModalConfirmation } from 'src/components/custom/CustomModalMethods'

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 75%;
  }
`

const Header = styled(CustomHeader)`
  display: flex;
  align-items: center;
  height: 64px;
  width: calc(100vw - 240px);
  box-shadow: ${({ theme }) => theme.boxShadow} !important;
  background-color: ${({ theme: { isDark } }) =>
    isDark ? '#000000' : '#f5f5f5'} !important;
`

const Content = styled(CustomContent)`
  overflow: auto;
  padding: 24px 50px;
  margin: 15px 0 0 0;
  min-height: 280px;
  width: 100%;
  max-width: 1200px;
  background-color: ${({ theme: { isDark, baseBgColor } }) =>
    isDark ? undefined : baseBgColor} !important;
  border-radius: ${({ theme }) => theme.borderRadius}px !important;
`

const Sider = styled(CustomSider)`
  height: 100vh !important;
  background-color: ${({ theme: { isDark, colorBgLayout } }) =>
    isDark ? '#001529' : colorBgLayout} !important;
  box-shadow: ${({ theme }) => theme.boxShadow} !important;
  padding: 10px !important;
  position: relative;

  .btn-logout {
    position: absolute;
    bottom: 1%;
    left: 0;
    width: calc(100% - 20px);
    margin: 0 10px;
  }
`

const Menu = styled(CustomMenu)`
  border-right: 0;
  background-color: ${({ theme: { isDark, colorBgLayout } }) =>
    isDark ? '#001529' : colorBgLayout} !important;
`

const Layout = styled(CustomLayout)`
  height: 100vh !important;
`

const RootTemplate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAppContext()

  useGetUserMenuOptionsQuery()

  const {
    setCurrentMenuOption,
    currenMenuOption,
    menuOptions,
    setOpenKeys,
    setSelectedKeys,
    openKeys,
    selectedKeys,
    reset,
  } = useMenuOptionStore()

  useEffect(() => {
    let current = currenMenuOption
    if (currenMenuOption?.MENU_OPTION_ID !== activityId) {
      current = menuOptions.find((item) => item?.MENU_OPTION_ID === activityId)
    }
    const keys = findParentKeys(menuOptions, [
      current?.MENU_OPTION_ID,
    ]) as string[]
    setOpenKeys([...keys, current?.PARENT_ID, current?.MENU_OPTION_ID])
    setSelectedKeys([current?.MENU_OPTION_ID])
  }, [currenMenuOption])

  useEffect(() => {
    if (
      activityId !== currenMenuOption?.MENU_OPTION_ID ||
      !currenMenuOption?.MENU_OPTION_ID
    ) {
      setCurrentMenuOption(
        menuOptions.find((item) => item.MENU_OPTION_ID === activityId)
      )
    }
  }, [activityId, menuOptions])

  const handleClickOption = (option: MenuOption) => {
    if (option?.CHILDREN?.length) return

    setCurrentMenuOption(option)
    navigate(option.PATH)
  }

  const getSubMenu = (options: MenuOption[]): MenuProps['items'] => {
    return options?.map((option: MenuOption) => {
      return {
        key: option?.MENU_OPTION_ID,
        title: option.NAME,
        type: option.TYPE,
        icon: <SVGReader svg={option.ICON} />,
        onClick: option.CHILDREN.length
          ? undefined
          : () => handleClickOption(option),
        children: option?.CHILDREN?.length
          ? getSubMenu(option.CHILDREN)
          : undefined,
        label: (
          <CustomTooltip placement={'right'} title={option.NAME}>
            <div style={{ width: '100%', display: 'block' }}>{option.NAME}</div>
          </CustomTooltip>
        ),
      }
    }) as never
  }

  const items = getSubMenu(menuOptions)
  const getLevelKeys = (items1: MenuProps['items']) => {
    const key: Record<string, number> = {}
    const func = (items2: MenuProps['items'], level = 1) => {
      items2.forEach((item) => {
        if (item?.key) {
          key[item.key?.toString()] = level
        }
        if (item?.['children']) {
          func(item?.['children'], level + 1)
        }
      })
    }
    func(items1)
    return key
  }

  const levelKeys = getLevelKeys(items)

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const currentOpenKey = keys.find((key) => openKeys.indexOf(key) === -1)
    if (currentOpenKey !== undefined) {
      const repeatIndex = keys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey])

      setOpenKeys(
        keys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      )
    } else {
      setOpenKeys(keys)
    }
  }

  const handleRemoveSession = () => {
    CustomModalConfirmation({
      type: 'warn',
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
    <ConditionalComponent condition={isAuthenticated} fallback={children}>
      <ThemeTransitionLayout>
        <Layout hasSider>
          <Sider width={240}>
            <CustomRow justify={'center'} style={{ height: '100px' }}>
              <LogoContainer>
                <img src={'/assets/logo.png'} />
              </LogoContainer>
            </CustomRow>
            <Menu
              mode={'inline'}
              openKeys={openKeys}
              selectedKeys={selectedKeys}
              items={items}
              onOpenChange={handleOpenChange}
            />

            <CustomButton
              size={'large'}
              className={'btn-logout'}
              type={'text'}
              onClick={handleRemoveSession}
              icon={<LogoutOutlined />}
            >
              Cerrar Sesión
            </CustomButton>
          </Sider>
          <CustomLayout>
            <Header>
              <CustomRow
                justify={'space-between'}
                width={'100%'}
                align={'middle'}
              >
                <CustomCol xs={12}>
                  <CustomTitle style={{ color: '#1c9bef' }} level={2}>
                    {currenMenuOption?.DESCRIPTION}
                  </CustomTitle>
                </CustomCol>
                <CustomRow gap={5}>
                  <CustomAvatar
                    size={44}
                    icon={<UserOutlined />}
                    src={
                      getSessionInfo().avatar ||
                      `https://ui-avatars.com/api/?name=${
                        getSessionInfo().name
                      }&background=random`
                    }
                  />
                  <CustomText strong>
                    {capitalize(
                      getSessionInfo().name || getSessionInfo().username || ''
                    )}
                  </CustomText>
                </CustomRow>
              </CustomRow>
            </Header>

            <CustomLayout style={{ padding: '0 24px 24px' }}>
              <CustomRow width={'100%'} justify={'center'}>
                <Content>{children}</Content>
              </CustomRow>
            </CustomLayout>
          </CustomLayout>
        </Layout>
      </ThemeTransitionLayout>
    </ConditionalComponent>
  )
}

export default RootTemplate
