/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef } from 'react'
import { IMaskInput } from 'react-imask'
import type { MaskedOptions } from 'imask'

export interface GenericMaskedInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'defaultValue'
  > {
  mask: MaskedOptions['mask'] | string | RegExp
  maskOptions?: Omit<MaskedOptions, 'mask'>
  value?: string | number | Date | null
  defaultValue?: string | number | Date
  unmask?: boolean | 'typed'
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAcceptValue?: (val: unknown) => void
  inputRef?: React.Ref<HTMLInputElement>
  name?: string
}

const GenericMaskedInput = forwardRef<
  HTMLInputElement,
  GenericMaskedInputProps
>(function GenericMaskedInput(
  {
    mask,
    maskOptions,
    value,
    defaultValue,
    unmask = false,
    onChange,
    onAcceptValue,
    name,
    inputRef,
    ...rest
  },
  ref
) {
  const setInputRef = (node: HTMLInputElement | null) => {
    if (typeof ref === 'function') ref(node)
    else if (ref)
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node

    if (typeof inputRef === 'function') inputRef(node)
    else if (inputRef && typeof inputRef === 'object')
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node
  }

  return (
    <IMaskInput
      {...rest}
      {...(maskOptions as any)}
      mask={mask as any}
      value={value as any}
      defaultValue={defaultValue as any}
      unmask={unmask}
      inputRef={setInputRef}
      onAccept={(val: any) => {
        if (onChange) {
          const str =
            typeof val === 'number' || val == null
              ? String(val ?? '')
              : (val as string)
          onChange({
            target: { name, value: str },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        onAcceptValue?.(val)
      }}
    />
  )
})

export default GenericMaskedInput
