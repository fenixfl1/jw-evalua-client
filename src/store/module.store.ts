import { Staff } from 'src/services/staff/staff.types'
import { WorkModule } from 'src/services/work_modules/module.types'
import { Metadata, ReturnPayload } from 'src/types/general'
import { create } from 'zustand'

interface UseModuleStore {
  workModules: WorkModule[]
  metadata: Metadata
  members: Staff[]
  setMembers: (members: Staff[]) => void
  setWorkModules: (payload: ReturnPayload<WorkModule>) => void
}

export const useModuleStore = create<UseModuleStore>((set) => ({
  workModules: [],
  members: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setMembers: (members) => set({ members }),
  setWorkModules: ({ data, metadata }) =>
    set({ metadata: metadata.pagination, workModules: data }),
}))
