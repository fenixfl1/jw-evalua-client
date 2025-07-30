import { Role } from 'src/services/roles/role.type'
import { Metadata, ReturnPayload } from 'src/types/general'
import { create } from 'zustand'

interface UseRoleStore {
  roleList: Role[]
  metadata: Metadata
  setRoleList: (payload: ReturnPayload<Role>) => void
}

export const useRoleStore = create<UseRoleStore>((set) => ({
  roleList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setRoleList: ({ data, metadata }) =>
    set({ roleList: data, metadata: metadata.pagination }),
}))
