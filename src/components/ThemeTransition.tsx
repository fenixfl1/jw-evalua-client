import { motion, AnimatePresence } from 'framer-motion'
import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import CustomFloatButton from './custom/CustomFloatButton'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useAppContext } from 'src/context/AppContext'
import ConditionalComponent from './ConditionalComponent'

const lightTheme = {
  background: '#ffffff',
  text: '#000000',
}

const darkTheme = {
  background: '#141414',
  text: '#ffffff',
}

const Root = styled.div<{ $bg: string; $color: string }>`
  position: relative;
  min-height: 100vh;
  background-color: ${(props) => props.$bg};
  color: ${(props) => props.$color};
  transition: background-color 0.4s ease, color 0.4s ease;
  overflow: hidden;
`

const ExpandingCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
`

const ThemeTransitionLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isAuthenticated, theme, setTheme } = useAppContext()
  const [circleProps, setCircleProps] = useState<{
    x: number
    y: number
    color: string
  } | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)

  const handleThemeToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = rootRef.current?.getBoundingClientRect()
    const clickX = e.clientX - (rect?.left || 0)
    const clickY = e.clientY - (rect?.top || 0)

    const nextTheme = theme === 'light' ? 'dark' : 'light'
    const nextColor =
      nextTheme === 'dark' ? darkTheme.background : lightTheme.background

    setCircleProps({ x: clickX, y: clickY, color: nextColor })

    // Eliminar el círculo tras el cambio, dándole tiempo para desvanecerse
    setTimeout(() => {
      setCircleProps(null)
    }, 420)

    // Cambiar el tema después de que el círculo cubra
    setTimeout(() => {
      setTheme(nextTheme)
    }, 400)
  }

  const isDark = theme === 'dark'
  const currentTheme = isDark ? darkTheme : lightTheme

  const icons = {
    dark: <SunOutlined />,
    light: <MoonOutlined />,
  }

  return (
    <Root
      ref={rootRef}
      $bg={currentTheme.background}
      $color={currentTheme.text}
    >
      <AnimatePresence>
        <ConditionalComponent condition={circleProps !== null}>
          <ExpandingCircle
            initial={{ scale: 0 }}
            animate={{ scale: 50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              top: circleProps?.y,
              left: circleProps?.x,
              width: 100,
              height: 100,
              backgroundColor: circleProps?.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </ConditionalComponent>
      </AnimatePresence>

      <div>{children}</div>

      <ConditionalComponent condition={isAuthenticated}>
        <CustomFloatButton
          style={{ zIndex: 9999 }}
          icon={icons[theme]}
          onClick={handleThemeToggle}
        />
      </ConditionalComponent>
    </Root>
  )
}

export default ThemeTransitionLayout
