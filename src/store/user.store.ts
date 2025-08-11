import { User } from 'src/services/users/users.types'
import { Metadata, ReturnPayload } from 'src/types/general'
import { create } from 'zustand'

interface UseUserStore {
  user: User
  userList: User[]
  metadata: Metadata
  profileVisibilityState: boolean
  setUser: (user: User) => void
  setProfileVisibilitySate: (state: boolean) => void
  setUserList: (payload: ReturnPayload<User>) => void
}

export const useUserStore = create<UseUserStore>((set) => ({
  userList: [],
  user: <User>{},
  profileVisibilityState: false,
  metadata: {
    currentPage: 1,
    pageSize: 15,
    count: 0,
    totalPages: 0,
    totalRows: 0,
    links: undefined,
  },
  setUser: (user) => set({ user }),
  setProfileVisibilitySate: (state) => set({ profileVisibilityState: state }),
  setUserList: ({ data, metadata }) =>
    set({ userList: data, metadata: metadata.pagination }),
}))
