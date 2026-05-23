import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  cartOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setCartOpen: (open: boolean) => void
  toggleSidebar: () => void
  toggleCart: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  cartOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCartOpen: (open) => set({ cartOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
}))
