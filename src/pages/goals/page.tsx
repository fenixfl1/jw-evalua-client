import React, { useCallback, useEffect } from 'react'
import { useGetPaginatedModulesMutation } from 'src/services/work_modules/useGetPaginatedModulesMutation'
import { AdvancedCondition } from 'src/types/general'

const Page: React.FC = () => {
  const { mutate: getModules } = useGetPaginatedModulesMutation()

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

  return <>Metas</>
}

export default Page
