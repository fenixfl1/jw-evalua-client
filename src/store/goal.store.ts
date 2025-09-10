import { ModuleSummaryDetail } from 'src/services/goals/types'
import { Metadata, ReturnPayload } from 'src/types/general'
import { create } from 'zustand'

interface UseGoalStore {
  moduleSummary: ModuleSummaryDetail[]
  metadata: Metadata
  setModuleSummary: (payload: ReturnPayload<ModuleSummaryDetail>) => void
}

export const useGoalStore = create<UseGoalStore>((set) => ({
  moduleSummary: [],
  setModuleSummary: ({ data, metadata }) =>
    set({ moduleSummary: data, metadata: metadata.pagination }),
  metadata: {
    currentPage: 1,
    totalPages: 0,
    totalRows: 0,
    count: 0,
    pageSize: 15,
    links: undefined,
  },
}))
