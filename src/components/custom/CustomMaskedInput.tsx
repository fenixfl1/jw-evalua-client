import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Input, { MaskedInputProps } from 'react-text-mask'
import CustomInput, { CustomInputProps } from './CustomInput'
import { MaskType } from 'src/types/general'
import { maskedInput } from 'src/constants/general'
import sleep from 'src/utils/sleep'
import ConditionalComponent from '../ConditionalComponent'

export type CustomProps = CustomInputProps &
  Omit<MaskedInputProps, 'mask'> &
  Omit<Readonly<MaskedInputProps>, 'mask'> & {
    prefix?: string & React.ReactNode
    props?: never
    type: keyof MaskType
  }

const MaskedInput: React.FC<CustomProps> = ({
  guide = false,
  autoComplete = 'off',
  disabled = false,
  keepCharPositions = true,
  className = 'ant-input ant-input-outlined ant-input-status-success',
  maxLength,
  width,
  type,
  ...props
}) => {
  const [classes, setClasses] = useState<string>('')
  const [maxLen, setMaxLen] = useState<number>()

  const mask = useMemo(() => {
    return maskedInput[type]
  }, [type])

  const handleClassName = useCallback(() => {
    sleep(100).then(() => {
      const form = document.querySelector('form')
      if (form) {
        const arrClass = form.className.split(' ')

        setClasses(className + ' ' + arrClass[arrClass.length - 1])
      }
    })
  }, [])

  useEffect(handleClassName, [handleClassName])

  useEffect(() => {
    setMaxLen(typeof mask === 'function' ? 16 : (mask as never[])?.length)
  }, [mask])

  return (
    <ConditionalComponent
      condition={classes.split(' ')?.length > 2}
      fallback={<CustomInput width={width} {...props} />}
    >
      <Input
        autoComplete={autoComplete}
        className={classes}
        disabled={disabled}
        guide={guide}
        keepCharPositions={keepCharPositions}
        mask={mask}
        maxLength={maxLength ?? maxLen}
        style={{ ...props.style, width }}
        {...props}
      />
    </ConditionalComponent>
  )
}

export default MaskedInput
