import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableQuery } from '../../../hooks/useTables'
import { useSettingsQuery } from '../../../hooks/useSettings'
import { useProcessPaymentMutation } from '../../../hooks/usePayment'
import CurrencyDisplay from '../../../components/CurrencyDisplay'
import { ChevronLeft, Landmark, DollarSign, CheckCircle2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function PaymentPage() {
  const { t } = useTranslation(['staff', 'common', 'order'])
  const { tableId } = useParams()
  const navigate = useNavigate()
  const numericTableId = Number(tableId)

  // Queries & Mutations
  const { data: table, isLoading: tableLoading, error: tableError } = useTableQuery(numericTableId)
  const { data: settings } = useSettingsQuery()
  const processPaymentMutation = useProcessPaymentMutation()

  // State
  const [method, setMethod] = useState<'cash' | 'qr'>('cash')
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [change, setChange] = useState<number>(0)

  const activeOrder = table?.active_order
  const totalAmount = activeOrder?.items?.reduce((acc, i) => acc + i.unit_price * i.quantity, 0) || 0

  // Calculate change in real-time
  useEffect(() => {
    if (amountPaid >= totalAmount) {
      setChange(amountPaid - totalAmount)
    } else {
      setChange(0)
    }
  }, [amountPaid, totalAmount])

  // Pre-fill amount paid for QR, or set to exact amount initially
  useEffect(() => {
    if (totalAmount) {
      setAmountPaid(totalAmount)
    }
  }, [totalAmount])

  if (tableLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{t('common:loading')}</p>
      </div>
    )
  }

  if (tableError || !table || !activeOrder) {
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

  // Handle Payment Submit
  const handleConfirmPayment = async () => {
    if (amountPaid < totalAmount) {
      toast.error('Amount paid must cover the total')
      return
    }

    try {
      await processPaymentMutation.mutateAsync({
        orderId: activeOrder.id,
        method,
        amountPaid,
      })
      toast.success(t('staff:paymentConfirmed'))
      navigate('/staff/tables')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  // Quick denomination helper
  const addDenomination = (amount: number) => {
    setAmountPaid((prev) => prev + amount)
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/staff/tables/${table.id}/billing`)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors p-0 h-auto cursor-pointer"
      >
        <ChevronLeft size={16} />
        {t('staff:billing')}
      </Button>

      {/* Payment Interface */}
      <Card className="glass border-border rounded-3xl overflow-hidden shadow-2xl relative bg-card text-foreground">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h2 className="text-base font-black text-foreground">{t('staff:payment')}</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t('order:tableNumber', { number: table.number })} &bull; ID: #{activeOrder.id}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-semibold">{t('staff:receiptTotal')}</span>
              <div className="text-sm font-black text-primary">
                <CurrencyDisplay amount={totalAmount} />
              </div>
            </div>
          </div>

          {/* Method Selector */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setMethod('cash')
                setAmountPaid(totalAmount)
              }}
              className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                method === 'cash'
                  ? 'bg-primary/20 text-primary border-primary/40 glow-brand'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <DollarSign size={14} />
              {t('staff:cashPayment')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMethod('qr')
                setAmountPaid(totalAmount)
              }}
              className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                method === 'qr'
                  ? 'bg-primary/20 text-primary border-primary/40 glow-brand'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Landmark size={14} />
              {t('staff:qrPayment')}
            </Button>
          </div>

          {/* Body content based on method */}
          {method === 'cash' ? (
            <div className="space-y-4">
              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                  {t('staff:amountReceived')} (MMK)
                </label>
                <Input
                  type="number"
                  value={amountPaid === 0 ? '' : amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  placeholder="Enter cash received..."
                  className="w-full h-12 px-4 bg-background border-border rounded-xl text-foreground text-sm font-bold placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                />
              </div>

              {/* Quick Denominations */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAmountPaid(totalAmount)}
                  className="h-10 bg-background hover:bg-muted text-foreground font-bold rounded-xl text-[10px] border border-border transition-colors cursor-pointer"
                >
                  Exact Amount
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addDenomination(1000)}
                  className="h-10 bg-background hover:bg-muted text-foreground font-bold rounded-xl text-[10px] border border-border transition-colors cursor-pointer"
                >
                  + K1,000
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addDenomination(5000)}
                  className="h-10 bg-background hover:bg-muted text-foreground font-bold rounded-xl text-[10px] border border-border transition-colors cursor-pointer"
                >
                  + K5,000
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addDenomination(10000)}
                  className="h-10 bg-background hover:bg-muted text-foreground font-bold rounded-xl text-[10px] border border-border transition-colors cursor-pointer"
                >
                  + K10,000
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addDenomination(20000)}
                  className="h-10 bg-background hover:bg-muted text-foreground font-bold rounded-xl text-[10px] border border-border transition-colors cursor-pointer"
                >
                  + K20,000
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAmountPaid(0)}
                  className="h-10 bg-destructive/10 hover:bg-destructive/20 text-destructive font-bold rounded-xl text-[10px] border border-destructive/20 transition-colors cursor-pointer"
                >
                  Clear
                </Button>
              </div>

              {/* Change Display */}
              <div className="flex justify-between items-center p-4 bg-background border border-border rounded-xl">
                <span className="text-xs font-semibold text-muted-foreground">{t('staff:change')}</span>
                <div className="text-sm font-black text-emerald-400">
                  <CurrencyDisplay amount={change} />
                </div>
              </div>
            </div>
          ) : (
            // QR payment method
            <div className="space-y-4 text-center">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {t('staff:scanToPay')}
              </label>

              <div className="flex items-center justify-center p-6 bg-background border border-border rounded-2xl max-w-[240px] mx-auto min-h-[180px]">
                {settings?.payment_qr_url ? (
                  <img
                    src={settings.payment_qr_url}
                    alt="Payment QR"
                    className="max-h-[160px] rounded-xl object-contain border border-border bg-white p-2"
                  />
                ) : (
                  <div className="text-center space-y-2 text-muted-foreground">
                    <ImageIcon size={28} className="mx-auto text-muted-foreground/60" />
                    <p className="text-[10px]">{t('staff:uploadQR')}</p>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground leading-normal max-w-[280px] mx-auto">
                {t('staff:qrPaymentDesc', { defaultValue: 'Show this QR code to the customer. Once they complete transfer, verify using your bank/payment app.' })}
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleConfirmPayment}
            disabled={processPaymentMutation.isPending || amountPaid < totalAmount}
            className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none text-white font-black text-xs rounded-xl glow-brand transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
          >
            {processPaymentMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={14} />
                {t('staff:confirmPayment')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

