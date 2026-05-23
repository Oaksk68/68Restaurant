import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableQuery } from '../../../hooks/useTables'
import CurrencyDisplay from '../../../components/CurrencyDisplay'
import { ChevronLeft, Receipt, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function BillingPage() {
  const { t, i18n } = useTranslation(['staff', 'common', 'order'])
  const { tableId } = useParams()
  const navigate = useNavigate()
  const numericTableId = Number(tableId)

  // Fetch table data
  const { data: table, isLoading, error } = useTableQuery(numericTableId)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{t('common:loading')}</p>
      </div>
    )
  }

  if (error || !table || !table.active_order) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="mb-4">{t('common:error')}</p>
        <Button
          onClick={() => navigate(`/staff/tables/${tableId}`)}
          variant="outline"
          className="h-10 px-4 rounded-xl cursor-pointer"
        >
          {t('common:back')}
        </Button>
      </div>
    )
  }

  const order = table.active_order
  const orderItems = order.items || []
  const subtotal = orderItems.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/staff/tables/${table.id}`)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors p-0 h-auto cursor-pointer"
      >
        <ChevronLeft size={16} />
        {t('staff:tableDetail', { number: table.number })}
      </Button>

      {/* Invoice Card */}
      <Card className="glass border-border rounded-3xl overflow-hidden shadow-2xl relative bg-card text-foreground">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />

        {/* Invoice Header */}
        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <Receipt size={18} className="text-primary" />
              {t('staff:billing')}
            </h2>
            <p className="text-[11px] text-muted-foreground">Order ID: #{order.id}</p>
          </div>

          <div className="text-right">
            <Badge variant="outline" className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border-amber-500/25 uppercase tracking-wide h-auto">
              {t('order:billed')}
            </Badge>
            <p className="text-[10px] text-muted-foreground mt-1.5">{t('order:tableNumber', { number: table.number })}</p>
          </div>
        </div>

        {/* Invoice Items List */}
        <CardContent className="p-6 divide-y divide-border space-y-4">
          <div className="space-y-3 pb-4">
            {orderItems.map((item) => {
              const name = i18n.language === 'my' ? item.menu_item.name_my : item.menu_item.name_en
              return (
                <div key={item.id} className="flex justify-between items-start gap-4 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-foreground">x{item.quantity}</span>
                      <h4 className="font-bold text-foreground truncate">{name}</h4>
                    </div>
                    {item.note && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 ml-5 italic">
                        {t('common:note')}: {item.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right font-semibold text-foreground flex-shrink-0">
                    <CurrencyDisplay amount={item.unit_price * item.quantity} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Calculations */}
          <div className="pt-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{t('order:subtotal', { defaultValue: 'Subtotal' })}</span>
              <CurrencyDisplay amount={subtotal} className="font-semibold text-foreground" />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{t('order:serviceCharge', { defaultValue: 'Service Charge' })} (0%)</span>
              <span>K 0</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{t('order:tax', { defaultValue: 'Tax' })} (0%)</span>
              <span>K 0</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-foreground">
              <span className="text-sm">{t('staff:receiptTotal')}</span>
              <CurrencyDisplay amount={subtotal} className="text-base text-foreground font-black" />
            </div>
          </div>
        </CardContent>

        {/* Invoice Footer / Action button */}
        <div className="p-6 bg-muted/30 border-t border-border">
          <Button
            onClick={() => navigate(`/staff/tables/${table.id}/payment`)}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-xs rounded-xl glow-brand transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <CreditCard size={14} />
            {t('staff:payNow')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
