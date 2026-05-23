import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import type { Order } from './useOrders'

export interface RestaurantTable {
  id: number
  number: number
  label: string | null
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  active_order?: Order | null
}

// Fetch all tables
export function useTablesQuery() {
  return useQuery<RestaurantTable[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await api.get('/tables')
      return res.data.data
    },
  })
}

// Fetch single table detail
export function useTableQuery(tableId: number | string | undefined) {
  return useQuery<RestaurantTable>({
    queryKey: ['tables', tableId],
    queryFn: async () => {
      const res = await api.get(`/tables/${tableId}`)
      return res.data.data
    },
    enabled: !!tableId,
  })
}

// Open order for a table
export function useOpenTableOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tableId: number) => {
      const res = await api.post(`/tables/${tableId}/open-order`)
      return res.data.data // returns the newly created or existing Order
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
