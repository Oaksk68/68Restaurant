import { create } from 'zustand'

export interface CartItem {
  menuItemId: number
  nameEn: string
  nameMy: string
  price: number
  quantity: number
  note?: string
}

interface CartStore {
  tableId: number | null
  items: CartItem[]
  setTableId: (id: number) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (menuItemId: number) => void
  updateQuantity: (menuItemId: number, quantity: number) => void
  updateNote: (menuItemId: number, note: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  tableId: null,
  items: [],
  setTableId: (id) => set({ tableId: id }),
  addItem: (newItem) => set((state) => {
    const existing = state.items.find(i => i.menuItemId === newItem.menuItemId)
    if (existing) {
      return { items: state.items.map(i => i.menuItemId === newItem.menuItemId ? { ...i, quantity: i.quantity + 1 } : i) }
    }
    return { items: [...state.items, { ...newItem, quantity: 1 }] }
  }),
  removeItem: (menuItemId) => set((state) => ({ items: state.items.filter(i => i.menuItemId !== menuItemId) })),
  updateQuantity: (menuItemId, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter(i => i.menuItemId !== menuItemId)
      : state.items.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i)
  })),
  updateNote: (menuItemId, note) => set((state) => ({
    items: state.items.map(i => i.menuItemId === menuItemId ? { ...i, note } : i)
  })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}))
