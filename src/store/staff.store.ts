import { create } from 'zustand'
import { Staff } from 'src/services/staff/staff.types'
import { Metadata, ReturnPayload } from 'src/types/general'

interface UseStaffStore {
  staffList: Staff[]
  metadata: Metadata
  setStaffList: (payload: ReturnPayload<Staff>) => void
}

export const useStaffStore = create<UseStaffStore>((set) => ({
  staffList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setStaffList: ({ data, metadata }) =>
    set({ staffList: data, metadata: metadata.pagination }),
}))
