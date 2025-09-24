import { create } from 'zustand'
import { Evaluation, EvaluationWithDetails } from 'src/services/evaluations/evaluation.types'
import { Metadata, ReturnPayload } from 'src/types/general'

interface UseEvaluationStore {
  evaluations: Evaluation[]
  metadata: Metadata
  selectedEvaluation: EvaluationWithDetails | null
  setEvaluations: (payload: ReturnPayload<Evaluation>) => void
  resetEvaluations: () => void
  setSelectedEvaluation: (evaluation: EvaluationWithDetails | null) => void
}

const initialMetadata: Metadata = {
  currentPage: 1,
  totalPages: 0,
  totalRows: 0,
  count: 0,
  pageSize: 15,
  links: undefined,
}

export const useEvaluationStore = create<UseEvaluationStore>((set) => ({
  evaluations: [],
  metadata: initialMetadata,
  selectedEvaluation: null,
  setEvaluations: ({ data, metadata }) =>
    set({ evaluations: data, metadata: metadata.pagination }),
  resetEvaluations: () => set({ evaluations: [], metadata: initialMetadata }),
  setSelectedEvaluation: (evaluation) => set({ selectedEvaluation: evaluation }),
}))
