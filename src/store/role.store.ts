import { Role } from 'src/services/roles/role.type'
import { Metadata, ReturnPayload } from 'src/types/general'
import { create } from 'zustand'

interface UseRoleStore {
  roleList: Role[]
  role: Role
  metadata: Metadata
  setRole: (role: Role) => void
  setRoleList: (payload: ReturnPayload<Role>) => void
}

export const useRoleStore = create<UseRoleStore>((set) => ({
  roleList: [],
  role: <Role>{},
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setRole: (role) => set({ role }),
  setRoleList: ({ data, metadata }) =>
    set({ roleList: data, metadata: metadata.pagination }),
}))
