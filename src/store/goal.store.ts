import { Goal, ModuleSummaryDetail } from 'src/services/goals/types'
import { Metadata, ReturnPayload } from 'src/types/general'
import { create } from 'zustand'

interface UseGoalStore {
  goals: Goal[]
  moduleSummary: ModuleSummaryDetail[]
  metadata: Metadata
  goalMetadata: Metadata
  setModuleSummary: (payload: ReturnPayload<ModuleSummaryDetail>) => void
  setGoals: (payload: ReturnPayload<Goal>) => void
}

const initialMetadata = {
  currentPage: 1,
  totalPages: 0,
  totalRows: 0,
  count: 0,
  pageSize: 15,
  links: undefined,
}

export const useGoalStore = create<UseGoalStore>((set) => ({
  goals: [],
  moduleSummary: [],
  setModuleSummary: ({ data, metadata }) =>
    set({ moduleSummary: data, metadata: metadata.pagination }),
  metadata: initialMetadata,
  goalMetadata: initialMetadata,
  setGoals: ({ data, metadata }) =>
    set({ goals: data, goalMetadata: metadata.pagination }),
}))
