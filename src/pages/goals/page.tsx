import { TabsProps } from 'antd'
import React, { useCallback, useEffect, useMemo } from 'react'
import CustomTabs from 'src/components/custom/CustomTabs'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'
import { useModuleStore } from 'src/store/module.store'
import { AdvancedCondition } from 'src/types/general'
import Goals from './components/Goals'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useSearchParams } from 'react-router-dom'

const Page: React.FC = () => {
  const [, setSearchParams] = useSearchParams()
  const { workModules } = useModuleStore()
  const { mutate: getModules, isPending: isGetModulesPending } =
    useGetPaginatedModulesMutation()

  const handleSearch = useCallback(() => {
    const condition: AdvancedCondition[] = [
      {
        value: 'A',
        field: 'STATE',
        operator: '=',
      },
    ]
    getModules({ page: 1, size: 100, condition })
  }, [])

  useEffect(handleSearch, [handleSearch])

  const items: TabsProps['items'] = useMemo(() => {
    return workModules.map((module) => ({
      key: `${module.MODULE_ID}`,
      label: module.DESCRIPTION,
      children: <Goals key={module.MODULE_ID} module={module} />,
      onClick: () => {},
    }))
  }, [workModules])

  return (
    <CustomSpin spinning={isGetModulesPending}>
      <CustomTabs
        tabPosition={'right'}
        items={items}
        onChange={(key) => {
          const params = new URLSearchParams()
          params.set('moduleId', key)
          setSearchParams(params, {
            preventScrollReset: true,
          })
        }}
      />
    </CustomSpin>
  )
}

export default Page
