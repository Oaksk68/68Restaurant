import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMonthlyReportQuery } from '../../../hooks/useReports'
import CurrencyDisplay from '../../../components/CurrencyDisplay'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { Calendar, DollarSign, ShoppingBag, TrendingUp, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function ReportsPage() {
  const { t, i18n } = useTranslation(['reports', 'common'])

  // Current year & month as defaults
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)

  // Queries
  const { data: report, isLoading, error } = useMonthlyReportQuery(selectedYear, selectedMonth)

  // Quick helper to construct month options
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = [2025, 2026, 2027]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{t('common:loading')}</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="mb-4">{t('common:error')}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="h-10 px-4 rounded-xl cursor-pointer"
        >
          {t('common:retry')}
        </Button>
      </div>
    )
  }

  // Format Recharts daily data
  const chartData = (report.daily || []).map((day) => {
    // Format date string "2026-05-23" to show just day number "23" for clean X-axis labeling
    const dayNum = new Date(day.date).getDate()
    return {
      name: String(dayNum),
      Revenue: day.revenue,
      Orders: day.orders,
    }
  })

  // Top Items Table Data
  const topItems = report.top_items || []

  return (
    <div className="space-y-6">
      {/* Header & Date Pickers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-primary">{t('reports:reports')}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('reports:businessPerformance', { defaultValue: 'Business performance and sales report' })}
          </p>
        </div>

        {/* Date select dropdowns */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Calendar size={12} className="absolute left-2.5 text-muted-foreground z-10" />
            <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
              <SelectTrigger className="pl-8 pr-3 h-8 bg-background border-border text-foreground cursor-pointer rounded-lg text-xs font-bold w-24">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                {months.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(0, m - 1).toLocaleString('default', { month: 'short' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
            <SelectTrigger className="px-3 h-8 bg-background border-border text-foreground cursor-pointer rounded-lg text-xs font-bold w-20">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border-border">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Metric 1: Revenue */}
        <Card className="glass p-5 border-border rounded-2xl flex items-center gap-4 relative overflow-hidden bg-card text-foreground">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <DollarSign size={20} />
          </div>
          <CardContent className="p-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('reports:totalRevenue')}
            </span>
            <div className="text-lg font-black text-foreground mt-0.5">
              <CurrencyDisplay amount={report.total_revenue} />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Orders */}
        <Card className="glass p-5 border-border rounded-2xl flex items-center gap-4 relative overflow-hidden bg-card text-foreground">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-500/5 blur-xl" />
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <ShoppingBag size={20} />
          </div>
          <CardContent className="p-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {t('reports:totalOrders')}
            </span>
            <div className="text-lg font-black text-foreground mt-0.5">
              {report.total_orders} {t('order:orders')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Chart */}
      <Card className="glass p-6 border-border rounded-3xl space-y-4 bg-card text-foreground">
        <CardContent className="p-0 space-y-4">
          <h3 className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp size={14} className="text-primary" />
            {t('reports:dailyBreakdown')}
          </h3>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px' }}
                    labelStyle={{ color: 'var(--muted-foreground)', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: 'var(--foreground)', fontSize: '11px' }}
                  />
                  <Bar dataKey="Revenue" fill="oklch(var(--color-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                {t('reports:noReportData')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Items Table */}
      <Card className="glass border-border rounded-3xl overflow-hidden p-6 space-y-4 bg-card text-foreground">
        <CardContent className="p-0 space-y-4">
          <h3 className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <Trophy size={14} className="text-amber-400" />
            {t('reports:topItems')}
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pb-3 font-semibold w-10 text-muted-foreground">#</TableHead>
                  <TableHead className="pb-3 font-semibold text-muted-foreground">{t('reports:itemName')}</TableHead>
                  <TableHead className="pb-3 font-semibold text-center text-muted-foreground">{t('reports:quantitySold')}</TableHead>
                  <TableHead className="pb-3 font-semibold text-right text-muted-foreground">{t('reports:itemRevenue')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.map((item, idx) => {
                  const name = i18n.language === 'my' ? item.menu_item.name_my : item.menu_item.name_en
                  return (
                    <TableRow key={item.menu_item_id} className="border-border hover:bg-muted/30">
                      <TableCell className="py-3 font-bold text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="py-3 font-bold text-foreground">{name}</TableCell>
                      <TableCell className="py-3 text-center font-bold text-primary">x{item.total_qty}</TableCell>
                      <TableCell className="py-3 text-right font-bold text-foreground">
                        <CurrencyDisplay amount={item.total_revenue} />
                      </TableCell>
                    </TableRow>
                  )
                })}
                {topItems.length === 0 && (
                  <TableRow className="hover:bg-transparent border-0">
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground italic">
                      {t('reports:noReportData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

