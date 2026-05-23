import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export interface DailyReport {
  date: string
  total_revenue: number
  total_orders: number
  payments: any[]
}

export interface MonthlyReport {
  year: number
  month: number
  total_revenue: number
  total_orders: number
  daily: Array<{
    date: string
    revenue: number
    orders: number
  }>
  top_items: Array<{
    menu_item_id: number
    total_qty: number
    total_revenue: number
    menu_item: {
      id: number
      name_en: string
      name_my: string
    }
  }>
}

export function useMonthlyReportQuery(year: number, month: number) {
  return useQuery<MonthlyReport>({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: async () => {
      const res = await api.get('/reports/monthly', { params: { year, month } })
      return res.data.data
    },
  })
}

export function useDailyReportQuery(date: string) {
  return useQuery<DailyReport>({
    queryKey: ['reports', 'daily', date],
    queryFn: async () => {
      const res = await api.get('/reports/daily', { params: { date } })
      return res.data.data
    },
    enabled: !!date,
  })
}
