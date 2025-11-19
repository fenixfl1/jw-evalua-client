import { FormItemProps } from 'antd'
import { createContext, useContext } from 'react'
import { AppError } from 'src/utils/app-error'

interface CustomFormItemProps extends FormItemProps {
  noSpaces?: boolean
  match?: RegExp
  matchMessage?: string
  uppercase?: boolean
  readonly?: boolean
}

const CustomFormItemContext = createContext<CustomFormItemProps>({})
const CustomFormItemProvider = CustomFormItemContext.Provider

function useFormItemContext() {
  const context = useContext(CustomFormItemContext)
  if (context === undefined) {
    throw new AppError(
      'useFormItemContext must be used within a CustomFormItemProvider'
    )
  }

  return context
}

export type { CustomFormItemProps }
export { useFormItemContext, CustomFormItemProvider }
