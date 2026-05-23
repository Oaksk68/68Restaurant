import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export interface Settings {
  restaurant_name: string
  payment_qr_url: string | null
}

export function useSettingsQuery() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings')
      return res.data.data
    },
  })
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Laravel PUT doesn't support multipart/form-data natively.
      // We spoof the method as PUT using POST.
      formData.append('_method', 'PUT')
      const res = await api.post('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
