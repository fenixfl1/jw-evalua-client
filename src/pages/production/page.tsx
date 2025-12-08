import { TabsProps } from 'antd'
import React, { useCallback, useEffect, useMemo } from 'react'
import CustomTabs from 'src/components/custom/CustomTabs'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'
import { useModuleStore } from 'src/store/module.store'
import { AdvancedCondition } from 'src/types/general'
import CustomSpin from 'src/components/custom/CustomSpin'
import { useSearchParams } from 'react-router-dom'
import Production from './components/Production'
import { getSessionInfo } from 'src/lib/session'

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

    if (['2', '3'].includes(getSessionInfo().roleId)) {
      condition.push({
        value: getSessionInfo().userId,
        field: 'SUPERVISOR_ID',
        operator: '=',
      })
    }

    getModules({ page: 1, size: 100, condition })
  }, [])

  useEffect(handleSearch, [handleSearch])

  const items: TabsProps['items'] = useMemo(() => {
    return workModules.map((module) => {
      return {
        key: `${module.MODULE_ID}`,
        label: module.DESCRIPTION,
        children: <Production key={module.MODULE_ID} module={module} />,
      }
    })
  }, [workModules])

  return (
    <CustomSpin spinning={isGetModulesPending}>
      <CustomTabs
        destroyOnHidden
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
