import { User } from 'src/services/users/users.types'
import { Metadata, ReturnPayload } from 'src/types/general'
import { create } from 'zustand'

interface UseUserStore {
  userList: User[]
  metadata: Metadata
  setUserList: (payload: ReturnPayload<User>) => void
}

export const useUserStore = create<UseUserStore>((set) => ({
  userList: [],
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setUserList: ({ data, metadata }) =>
    set({ userList: data, metadata: metadata.pagination }),
}))
