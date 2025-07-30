import React from 'react'
import { PopoverContainer } from './custom/CustomPopover'
import { FormInstance } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import { formItemLayout } from 'src/config/breakpoints'
import CustomButton from './custom/CustomButton'
import CustomCol from './custom/CustomCol'
import CustomForm from './custom/CustomFrom'
import CustomRow from './custom/CustomRow'

interface FilterTemplateProps {
  children: React.ReactNode[] | React.ReactNode
  onSearch?: () => void
  onFilter?: () => void
  form: FormInstance
  initialValue?: Record<string, unknown>
}

const FilterTemplate: React.FC<FilterTemplateProps> = ({
  children,
  onFilter,
  form,
  initialValue,
}) => {
  return (
    <>
      <PopoverContainer>
        <CustomCol xs={24}>
          <CustomForm
            form={form}
            layout={'vertical'}
            initialValues={initialValue}
            {...formItemLayout}
          >
            {children}
          </CustomForm>
        </CustomCol>
      </PopoverContainer>

      <CustomCol xs={24}>
        <CustomRow justify={'space-between'}>
          <CustomButton
            type={'link'}
            onClick={() => {
              form?.resetFields()
              onFilter?.()
            }}
          >
            Restablecer filtros
          </CustomButton>
          <CustomButton
            type={'primary'}
            icon={<FilterOutlined />}
            onClick={onFilter}
          >
            Aplicar filtros
          </CustomButton>
        </CustomRow>
      </CustomCol>
    </>
  )
}

export default FilterTemplate
