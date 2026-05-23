import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import type { MenuItem } from './useMenu'

export interface OrderItem {
  id: number
  order_id: number
  menu_item_id: number
  quantity: number
  unit_price: number
  note: string | null
  status: 'pending' | 'preparing' | 'served'
  menu_item: MenuItem
  created_at: string
  updated_at: string
}

export interface Table {
  id: number
  number: number
  label: string | null
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
}

export interface Order {
  id: number
  table_id: number
  status: 'open' | 'billed' | 'paid' | 'voided'
  note: string | null
  created_by: number | null
  opened_at: string
  closed_at: string | null
  created_at: string
  updated_at: string
  table?: Table
  items: OrderItem[]
  payment?: any
}

// Fetch all active open orders (Staff dashboard)
export function useOrdersQuery() {
  return useQuery<Order[]>({
    queryKey: ['orders', 'active'],
    queryFn: async () => {
      const res = await api.get('/orders')
      return res.data.data
    },
  })
}

// Fetch single order details
export function useOrderQuery(orderId: number | undefined) {
  return useQuery<Order>({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`)
      return res.data.data
    },
    enabled: !!orderId,
  })
}

// Create an order
export function useCreateOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { table_id: number; note?: string }) => {
      const res = await api.post(`/orders`, data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

// Create an order via public table endpoint
export function useCreatePublicOrderMutation() {
  return useMutation({
    mutationFn: async (data: { tableId: number; note?: string }) => {
      const res = await api.post(`/tables/${data.tableId}/orders`, { table_id: data.tableId, note: data.note })
      return res.data.data
    },
  })
}

// Add items to an existing order
export function useAddOrderItemsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, items }: { orderId: number; items: Array<{ menu_item_id: number; quantity: number; note?: string }> }) => {
      const res = await api.post(`/orders/${orderId}/items`, { items })
      return res.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

// Update order item (quantity or status)
export function useUpdateOrderItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, itemId, data }: { orderId: number; itemId: number; data: { quantity?: number; status?: 'pending' | 'preparing' | 'served'; note?: string } }) => {
      const res = await api.patch(`/orders/${orderId}/items/${itemId}`, data)
      return res.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

// Void/Delete order item
export function useDeleteOrderItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, itemId }: { orderId: number; itemId: number }) => {
      await api.delete(`/orders/${orderId}/items/${itemId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

// Lock/Request Bill for order
export function useBillOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: number) => {
      const res = await api.post(`/orders/${orderId}/bill`)
      return res.data.data
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}
