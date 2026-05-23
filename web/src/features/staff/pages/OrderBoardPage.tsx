import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrdersQuery, useUpdateOrderItemMutation } from '../../../hooks/useOrders'
import { useQueryClient } from '@tanstack/react-query'
import echo from '../../../lib/echo'
import { Clock, ChefHat, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatTime } from '../../../lib/formatters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function OrderBoardPage() {
  const { t, i18n } = useTranslation(['staff', 'order', 'common'])
  const queryClient = useQueryClient()

  // Queries & Mutations
  const { data: orders = [], isLoading, error } = useOrdersQuery()
  const updateItemMutation = useUpdateOrderItemMutation()

  // Reverb real-time listener
  useEffect(() => {
    const channel = echo.channel('orders')

    const handleRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    }

    channel.listen('.App\\Events\\OrderCreated', (e: any) => {
      handleRefresh()
      // Play system sound for new order if supported by browser
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioCtx.createOscillator()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime) // A4
        oscillator.connect(audioCtx.destination)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.15)
      } catch (err) {
        // AudioContext blocked or not supported
      }

      toast.success(`${t('order:newOrder')} #${e.order.id} - ${t('common:table')} ${e.order.table?.number}`, {
        duration: 5000,
        icon: '🔔',
      })
    })

    channel.listen('.App\\Events\\OrderUpdated', handleRefresh)

    return () => {
      echo.leaveChannel('orders')
    }
  }, [queryClient, t])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{t('common:loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p className="mb-4">{t('common:error')}</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['orders', 'active'] })}
          variant="outline"
          className="h-10 px-4 rounded-xl cursor-pointer"
        >
          {t('common:retry')}
        </Button>
      </div>
    )
  }

  // Extract all items from active orders with their order context
  const allItems = orders.flatMap((order) =>
    (order.items || []).map((item) => ({
      ...item,
      tableNumber: order.table?.number,
      tableLabel: order.table?.label,
      orderNote: order.note,
      orderedAt: order.created_at,
    }))
  )

  // Split into columns
  const pendingItems = allItems.filter((i) => i.status === 'pending')
  const preparingItems = allItems.filter((i) => i.status === 'preparing')
  const servedItems = allItems.filter((i) => i.status === 'served')

  // Status transition handler
  const handleStatusTransition = async (
    orderId: number,
    itemId: number,
    nextStatus: 'pending' | 'preparing' | 'served'
  ) => {
    try {
      await updateItemMutation.mutateAsync({
        orderId,
        itemId,
        data: { status: nextStatus },
      })
      toast.success(t('common:success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-primary">{t('staff:orderBoard')}</h1>
          <p className="text-xs text-muted-foreground mt-1">{t('order:orders')} &bull; {orders.length} {t('common:active')}</p>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[65vh]">
        {/* Column 1: Pending */}
        <div className="flex flex-col bg-card/40 border border-border rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Clock size={16} />
              {t('order:pending')}
            </h2>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/25 h-auto">
              {pendingItems.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {pendingItems.map((item) => {
              const itemName = i18n.language === 'my' ? item.menu_item.name_my : item.menu_item.name_en
              return (
                <Card key={item.id} className="glass p-4 border-border rounded-xl space-y-3 flex flex-col justify-between bg-card text-foreground">
                  <CardContent className="p-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary">x{item.quantity}</span>
                        <h4 className="text-sm font-black text-foreground leading-tight">{itemName}</h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-muted text-muted-foreground border-border h-auto">
                        {t('common:table')} {item.tableNumber}
                      </Badge>
                    </div>

                    {item.note && (
                      <p className="text-xs text-amber-400/90 font-medium bg-amber-500/5 border border-amber-500/10 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 leading-normal">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>{item.note}</span>
                      </p>
                    )}
                  </CardContent>

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground font-semibold">{formatTime(item.orderedAt)}</span>
                    <Button
                      onClick={() => handleStatusTransition(item.order_id, item.id, 'preparing')}
                      disabled={updateItemMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-all h-8 cursor-pointer border-0"
                    >
                      <ChefHat size={12} />
                      {t('order:markPreparing')}
                    </Button>
                  </div>
                </Card>
              )
            })}
            {pendingItems.length === 0 && (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
                {t('common:noData')}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="flex flex-col bg-card/40 border border-border rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <h2 className="text-sm font-black text-blue-400 flex items-center gap-2">
              <ChefHat size={16} />
              {t('order:preparing')}
            </h2>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/25 h-auto">
              {preparingItems.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {preparingItems.map((item) => {
              const itemName = i18n.language === 'my' ? item.menu_item.name_my : item.menu_item.name_en
              return (
                <Card key={item.id} className="glass p-4 border-border rounded-xl space-y-3 flex flex-col justify-between bg-card text-foreground">
                  <CardContent className="p-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary">x{item.quantity}</span>
                        <h4 className="text-sm font-black text-foreground leading-tight">{itemName}</h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-muted text-muted-foreground border-border h-auto">
                        {t('common:table')} {item.tableNumber}
                      </Badge>
                    </div>

                    {item.note && (
                      <p className="text-xs text-amber-400/90 font-medium bg-amber-500/5 border border-amber-500/10 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5 leading-normal">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <span>{item.note}</span>
                      </p>
                    )}
                  </CardContent>

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={() => handleStatusTransition(item.order_id, item.id, 'pending')}
                      disabled={updateItemMutation.isPending}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 h-7 p-0 cursor-pointer hover:bg-transparent"
                    >
                      <RotateCcw size={10} />
                      {t('common:cancel')}
                    </Button>
                    <Button
                      onClick={() => handleStatusTransition(item.order_id, item.id, 'served')}
                      disabled={updateItemMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition-all h-8 cursor-pointer border-0"
                    >
                      <CheckCircle2 size={12} />
                      {t('order:markServed')}
                    </Button>
                  </div>
                </Card>
              )
            })}
            {preparingItems.length === 0 && (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
                {t('common:noData')}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Served */}
        <div className="flex flex-col bg-card/40 border border-border rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
            <h2 className="text-sm font-black text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {t('order:served')}
            </h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 h-auto">
              {servedItems.length}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {servedItems.map((item) => {
              const itemName = i18n.language === 'my' ? item.menu_item.name_my : item.menu_item.name_en
              return (
                <Card key={item.id} className="glass p-4 border-border rounded-xl space-y-3 flex flex-col justify-between opacity-75 hover:opacity-100 transition-opacity bg-card text-foreground">
                  <CardContent className="p-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary">x{item.quantity}</span>
                        <h4 className="text-sm font-black text-muted-foreground leading-tight line-through">{itemName}</h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-muted text-muted-foreground border-border h-auto">
                        {t('common:table')} {item.tableNumber}
                      </Badge>
                    </div>

                    {item.note && (
                      <p className="text-xs text-muted-foreground font-medium bg-muted border border-border px-2 py-1 rounded-md inline-block">
                        {t('common:note')}: {item.note}
                      </p>
                    )}
                  </CardContent>

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground font-semibold">{formatTime(item.orderedAt)}</span>
                    <Button
                      variant="ghost"
                      onClick={() => handleStatusTransition(item.order_id, item.id, 'preparing')}
                      disabled={updateItemMutation.isPending}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold h-7 p-0 cursor-pointer hover:bg-transparent"
                    >
                      <RotateCcw size={10} />
                      {t('common:cancel')}
                    </Button>
                  </div>
                </Card>
              )
            })}
            {servedItems.length === 0 && (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
                {t('common:noData')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

