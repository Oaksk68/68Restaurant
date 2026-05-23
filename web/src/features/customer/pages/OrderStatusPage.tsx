import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrderQuery } from '../../../hooks/useOrders'
import { useQueryClient } from '@tanstack/react-query'
import echo from '../../../lib/echo'
import { ChevronLeft, Clock, ChefHat, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function OrderStatusPage() {
  const { t, i18n } = useTranslation(['order', 'common'])
  const { tableId, orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const numericOrderId = Number(orderId)

  // Fetch Order details
  const { data: order, isLoading, error } = useOrderQuery(numericOrderId)

  // Real-time listener for order item updates
  useEffect(() => {
    if (!numericOrderId) return

    const channel = echo.channel(`orders.${numericOrderId}`)
    
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['orders', numericOrderId] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    }

    channel.listen('.App\\Events\\OrderUpdated', handleUpdate)
    channel.listen('.App\\Events\\OrderItemUpdated', handleUpdate)

    return () => {
      echo.leaveChannel(`orders.${numericOrderId}`)
    }
  }, [numericOrderId, queryClient])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{t('common:loading')}</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="mb-4">{t('common:error')}</p>
        <Button
          onClick={() => navigate(`/table/${tableId}`)}
          variant="outline"
          className="h-10 px-4 rounded-xl cursor-pointer"
        >
          {t('common:back')}
        </Button>
      </div>
    )
  }

  // Calculate high-level order state
  const items = order.items || []
  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0)
  const preparingCount = items.filter(i => i.status === 'preparing').length
  const servedCount = items.filter(i => i.status === 'served').length

  let overallStatus: 'pending' | 'preparing' | 'served' = 'pending'
  if (items.length > 0) {
    if (servedCount === items.length) {
      overallStatus = 'served'
    } else if (preparingCount > 0 || servedCount > 0) {
      overallStatus = 'preparing'
    }
  }

  return (
    <div className="px-4 pt-4 pb-20 space-y-6">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/table/${tableId}`)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer px-3 h-8 rounded-lg"
      >
        <ChevronLeft size={16} />
        {t('order:orderStatus')}
      </Button>

      {/* Progress Card */}
      <Card className="glass border border-border rounded-2xl p-6 text-center space-y-6 relative overflow-hidden bg-card text-foreground">
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          {overallStatus === 'pending' && (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 animate-pulse">
              <Clock size={24} />
            </div>
          )}
          {overallStatus === 'preparing' && (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
              <ChefHat size={24} className="animate-bounce" />
            </div>
          )}
          {overallStatus === 'served' && (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <CheckCircle2 size={24} />
            </div>
          )}

          <h2 className="text-lg font-black text-foreground">
            {overallStatus === 'pending' && t('order:waitingForOrder')}
            {overallStatus === 'preparing' && t('order:yourOrderIsBeingPrepared')}
            {overallStatus === 'served' && t('order:allItemsServed')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t('order:tableNumber', { number: order.table?.number })} &bull; #{order.id}
          </p>
        </div>

        {/* Progress Bar Steps */}
        <div className="flex items-center justify-between max-w-xs mx-auto relative px-2">
          {/* Background line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-border -z-10" />
          {/* Active line */}
          <div
            className="absolute left-8 top-1/2 -translate-y-1/2 h-0.5 bg-primary -z-10 transition-all duration-550"
            style={{
              width:
                overallStatus === 'served'
                  ? 'calc(100% - 4rem)'
                  : overallStatus === 'preparing'
                  ? 'calc(50% - 2rem)'
                  : '0%',
            }}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                overallStatus === 'pending' || overallStatus === 'preparing' || overallStatus === 'served'
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-background border-border text-muted-foreground'
              }`}
            >
              1
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{t('order:pending')}</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                overallStatus === 'preparing' || overallStatus === 'served'
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-background border-border text-muted-foreground'
              }`}
            >
              2
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{t('order:preparing')}</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                overallStatus === 'served'
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-background border-border text-muted-foreground'
              }`}
            >
              3
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{t('order:served')}</span>
          </div>
        </div>
      </Card>

      {/* Items List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {t('order:orderItems')} ({totalItemsCount})
        </h3>
        
        <div className="space-y-2">
          {items.map((item) => {
            const itemName = i18n.language === 'my' ? item.menu_item.name_my : item.menu_item.name_en
            return (
              <Card key={item.id} className="glass p-3.5 border border-border rounded-xl flex justify-between items-center gap-4 bg-card text-foreground">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary">x{item.quantity}</span>
                    <h4 className="text-sm font-bold text-foreground truncate">{itemName}</h4>
                  </div>
                  {item.note && (
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium bg-background border border-border px-2 py-0.5 rounded-md inline-block">
                      {t('common:note')}: {item.note}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {item.status === 'pending' && (
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 h-auto">
                      {t('order:pending')}
                    </Badge>
                  )}
                  {item.status === 'preparing' && (
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 h-auto">
                      {t('order:preparing')}
                    </Badge>
                  )}
                  {item.status === 'served' && (
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 h-auto">
                      {t('order:served')}
                    </Badge>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Button to add more */}
      <Button
        variant="outline"
        onClick={() => navigate(`/table/${tableId}`)}
        className="w-full flex items-center justify-between p-6 bg-card border border-border hover:bg-muted text-foreground rounded-xl transition-all cursor-pointer h-auto"
      >
        <span className="text-xs font-bold">{t('menu:addToCart')}</span>
        <div className="flex items-center gap-1 text-primary text-xs font-bold">
          {t('menu:menu')}
          <ArrowRight size={14} />
        </div>
      </Button>
    </div>
  )
}
