import { FormProps } from 'antd'
import { createContext, useContext } from 'react'
import { AppError } from 'src/utils/app-error'

export interface PayloadOptions {
  fields?: (string | string[])[]
  hiddenItems?: (string | string[])[]
  open?: boolean
}

interface CustomFormProps extends FormProps {
  readonly?: boolean
  width?: string | number
  excludeFieldsOncopy?: string[]
  payloadOptions?: boolean | PayloadOptions
  children?: React.ReactNode | React.ReactNode[]
}

const CustomFormContext = createContext<CustomFormProps>({})
const CustomFormProvider = CustomFormContext.Provider

function useFormContext() {
  const context = useContext(CustomFormContext)
  if (context === undefined) {
    throw new AppError(
      'useFormContext must be used within a CustomFormProvider'
    )
  }
  return context
}

export type { CustomFormProps }
export { useFormContext, CustomFormContext, CustomFormProvider }
