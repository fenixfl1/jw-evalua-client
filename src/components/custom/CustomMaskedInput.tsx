import React from 'react'
import InputMask from 'react-input-mask'
import CustomInput, { CustomInputProps } from './CustomInput'
import { Input } from 'antd'

interface CustomMaskedInputProps
  extends Omit<CustomInputProps, 'autoComplete' | 'value'> {
  mask: string | (string | RegExp)[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any
}

const CustomMaskedInput: React.FC<CustomMaskedInputProps> = ({
  mask,
  value,
  onChange,
  ...props
}) => {
  return (
    <InputMask mask={mask} value={value} onChange={onChange}>
      {({ ...inputProps }) => (
        <Input {...inputProps} {...props} />
        // <CustomInput
        //   ref={ref}
        //   tooltip={tooltip}
        //   status={status}
        //   prefix={prefix}
        //   suffix={suffix}
        //   size={size}
        //   disabled={disabled}
        //   width={width}
        //   rootClassName={rootClassName}
        //   alwaysAvailable={alwaysAvailable}
        //   notNumber={notNumber}
        //   {...inputProps}
        //   {...props}
        // />
      )}
    </InputMask>
  )
}

export default CustomMaskedInput
