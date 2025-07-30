import React from 'react'
import ConditionalComponent from './ConditionalComponent'
import { FilterOutlined, PlusOutlined } from '@ant-design/icons'
import { FormInstance } from 'antd'
import FilterTemplate from './FilterTemplate'
import CustomButton from './custom/CustomButton'
import CustomCol from './custom/CustomCol'
import CustomDivider from './custom/CustomDivider'
import CustomPopover from './custom/CustomPopover'
import CustomRow from './custom/CustomRow'
import CustomSearch from './custom/CustomSearch'
import CustomTooltip from './custom/CustomTooltip'

interface SearchBarProps {
  onSearch?: (value: string) => void
  onCreate?: () => void
  filterContent?: React.JSX.Element
  createText?: string
  searchPlaceholder?: string
  form: FormInstance
  initialValue?: Record<string, unknown>
  onFilter?: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  filterContent,
  onCreate,
  onSearch,
  createText = 'Crear',
  searchPlaceholder = 'Buscar...',
  onFilter,
  form,
  initialValue,
}) => {
  const content = (
    <FilterTemplate
      onSearch={() => onSearch?.('')}
      onFilter={onFilter}
      form={form}
      initialValue={initialValue}
    >
      {filterContent}
    </FilterTemplate>
  )

  return (
    <CustomCol xs={24}>
      <CustomRow justify={'space-between'}>
        <ConditionalComponent
          condition={!!filterContent}
          fallback={<CustomCol xs={2} />}
        >
          <CustomTooltip title={'Filtros'} placement={'left'}>
            <CustomPopover
              content={content}
              title={'Filtros'}
              trigger={'click'}
            >
              <CustomButton
                size={'large'}
                type={'text'}
                icon={<FilterOutlined />}
              />
            </CustomPopover>
          </CustomTooltip>
        </ConditionalComponent>
        <CustomCol xs={14}>
          <CustomRow justify={'end'} gap={5} wrap={false}>
            <CustomSearch
              width={'80%'}
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
            />
            <CustomButton
              icon={<PlusOutlined />}
              type={'primary'}
              onClick={onCreate}
            >
              {createText}
            </CustomButton>
          </CustomRow>
        </CustomCol>
      </CustomRow>

      <CustomDivider />
    </CustomCol>
  )
}

export default SearchBar
