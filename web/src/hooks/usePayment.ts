import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export function useProcessPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, method, amountPaid }: { orderId: number; method: 'cash' | 'qr'; amountPaid: number }) => {
      const res = await api.post(`/orders/${orderId}/pay`, {
        method,
        amount_paid: amountPaid,
      })
      return res.data // returns data (payment model) and change
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}
