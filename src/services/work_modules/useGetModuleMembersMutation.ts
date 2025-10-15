import { useCustomMutation } from 'src/hooks/use-custom-mutation'
import { Staff } from '../staff/staff.types'
import { SimpleCondition } from 'src/types/general'
import { postRequest } from '../api'
import { API_PATH_GET_MODULE_MEMBERS } from 'src/constants/routes'
import { useModuleStore } from 'src/store/module.store'

type GetMemberPayload = SimpleCondition<{
  MODULE_ID: number
  STAFF_ID: number
  STATE: 'A' | 'I'
}>

export function useGetModuleMembersMutation() {
  const { setMembers } = useModuleStore()

  return useCustomMutation<Staff[], GetMemberPayload>({
    initialData: [],
    mutationKey: ['module', 'get-module-member'],
    onSuccess: setMembers,
    onError: () => setMembers([]),
    mutationFn: async (payload) => {
      const {
        data: { data },
      } = await postRequest<Staff[]>(API_PATH_GET_MODULE_MEMBERS, payload)

      return data || []
    },
  })
}
