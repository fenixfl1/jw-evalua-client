import { TabsProps } from 'antd'
import React, { useCallback, useEffect, useMemo } from 'react'
import CustomTabs from 'src/components/custom/CustomTabs'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'
import { useModuleStore } from 'src/store/module.store'
import { AdvancedCondition } from 'src/types/general'
import Goals from './components/Goals'
import CustomSpin from 'src/components/custom/CustomSpin'

const Page: React.FC = () => {
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
      children: <Goals module={module} />,
    }))
  }, [workModules])

  return (
    <CustomSpin spinning={isGetModulesPending}>
      <CustomTabs tabPosition={'right'} items={items} />
    </CustomSpin>
  )
}

export default Page
