import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useTableQuery } from '../../../hooks/useTables'
import { useMenuQuery } from '../../../hooks/useMenu'
import { useCreatePublicOrderMutation, useAddOrderItemsMutation } from '../../../hooks/useOrders'
import { useCartStore } from '../../../stores/useCartStore'
import CurrencyDisplay from '../../../components/CurrencyDisplay'
import { ShoppingBag, Search, Plus, Minus, Trash2, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function MenuPage() {
  const { t, i18n } = useTranslation(['menu', 'order', 'common'])
  const { tableId } = useParams()
  const navigate = useNavigate()
  const numericTableId = Number(tableId)

  // Zustand Store
  const { items: cartItems, addItem, updateQuantity, updateNote, removeItem, clearCart, setTableId, total: cartTotal } = useCartStore()

  // Set table ID in cart store on mount
  useEffect(() => {
    if (numericTableId) {
      setTableId(numericTableId)
    }
  }, [numericTableId, setTableId])

  // Queries & Mutations
  const { data: table, isLoading: tableLoading, error: tableError } = useTableQuery(numericTableId)
  const { data: categories, isLoading: menuLoading, error: menuError } = useMenuQuery()
  const createOrderMutation = useCreatePublicOrderMutation()
  const addItemsMutation = useAddOrderItemsMutation()

  // State
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [itemNoteModal, setItemNoteModal] = useState<{ id: number; note: string } | null>(null)

  const isLoading = tableLoading || menuLoading
  const hasError = tableError || menuError

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{t('common:loading')}</p>
      </div>
    )
  }

  if (hasError || !table) {
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

  // Filter items
  const allItems = categories?.flatMap(c => c.menu_items || []) || []
  const activeCategoryData = categories?.find(c => c.id === selectedCategory)
  const itemsInScope = selectedCategory === null ? allItems : (activeCategoryData?.menu_items || [])
  const filteredItems = itemsInScope.filter(item => {
    const name = i18n.language === 'my' ? item.name_my : item.name_en
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Handle placing order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return

    try {
      // 1. Create or get open order for this table
      const order = await createOrderMutation.mutateAsync({ tableId: numericTableId })
      
      // 2. Add items to order
      const itemsPayload = cartItems.map(item => ({
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        note: item.note || undefined,
      }))
      
      await addItemsMutation.mutateAsync({ orderId: order.id, items: itemsPayload })
      
      toast.success(t('order:orderPlaced'))
      clearCart()
      setCartOpen(false)
      navigate(`/table/${numericTableId}/status/${order.id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  return (
    <div className="px-4 pb-20 relative">
      {/* Header Info */}
      <div className="py-4 border-b border-border mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border-primary/25 text-xs font-semibold h-auto">
              {t('order:tableNumber', { number: table.number })}
            </Badge>
            {table.active_order && (
              <Button
                variant="link"
                onClick={() => navigate(`/table/${numericTableId}/status/${table.active_order?.id}`)}
                className="text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-auto p-0 cursor-pointer"
              >
                <Clock size={12} />
                {t('order:orderStatus')}
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {categories?.reduce((acc, cat) => acc + (cat.menu_items?.length || 0), 0)} {t('menu:menu')}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('menu:searchMenu')}
          className="w-full pl-10 pr-4 h-11 bg-card border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
        />
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sticky top-14 bg-background/95 backdrop-blur-md z-10">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedCategory(null)
            setSearchQuery('')
          }}
          className={`shrink-0 px-4 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === null
              ? 'bg-primary/20 text-primary border-primary/40 glow-brand hover:bg-primary/20 hover:text-primary'
              : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
          }`}
        >
          {t('menu:allItems')}
        </Button>
        {categories?.map((cat) => {
          const isSelected = selectedCategory === cat.id
          const catName = i18n.language === 'my' ? cat.name_my : cat.name_en
          return (
            <Button
              key={cat.id}
              variant="outline"
              onClick={() => {
                setSelectedCategory(cat.id)
                setSearchQuery('')
              }}
              className={`shrink-0 px-4 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/20 text-primary border-primary/40 glow-brand hover:bg-primary/20 hover:text-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              {catName}
            </Button>
          )
        })}
      </div>

      {/* Menu Item Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const name = i18n.language === 'my' ? item.name_my : item.name_en
            const description = i18n.language === 'my' ? item.description_my : item.description_en
            const inCart = cartItems.find(c => c.menuItemId === item.id)

            return (
              <Card
                key={item.id}
                className="glass rounded-2xl p-4 flex gap-4 border border-border hover:border-border/80 transition-all relative overflow-hidden group bg-card text-foreground"
              >
                {/* Image / Placeholder */}
                <div className="w-20 h-20 rounded-xl bg-background border border-border flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                  {item.image_path ? (
                    <img
                      src={`/storage/${item.image_path}`}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center brand-gradient opacity-80 text-white font-bold text-xs uppercase">
                      {name.substring(0, 2)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate">{name}</h3>
                    {description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <CurrencyDisplay amount={item.price} className="text-sm font-bold text-primary" />

                    {/* Quantity control / Add button */}
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-card border-border hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </Button>
                        <span className="text-xs font-bold text-foreground w-4 text-center">{inCart.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-card border-border hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() =>
                          addItem({
                            menuItemId: item.id,
                            nameEn: item.name_en,
                            nameMy: item.name_my,
                            price: item.price,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 h-8 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-lg transition-all cursor-pointer border-0 animate-scale-up"
                      >
                        <Plus size={12} />
                        {t('menu:addToCart')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            {t('menu:noItems')}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-30">
          <Button
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between px-5 h-14 bg-primary text-primary-foreground font-bold rounded-2xl glow-brand hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer border-0"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-2.5 -right-2.5 bg-background text-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-primary animate-pulse">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <span className="text-sm uppercase tracking-wide">{t('order:cart')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-normal opacity-85">{t('common:total')}:</span>
              <CurrencyDisplay amount={cartTotal()} className="text-sm font-black text-primary-foreground" />
            </div>
          </Button>
        </div>
      )}

      {/* Cart Drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl p-0 gap-0">
          {/* Drawer Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <SheetTitle className="text-base font-black text-foreground flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" />
              {t('order:cart')}
            </SheetTitle>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.map((item) => {
              const itemName = i18n.language === 'my' ? item.nameMy : item.nameEn
              return (
                <div key={item.menuItemId} className="p-3.5 bg-background border border-border rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{itemName}</h4>
                      <CurrencyDisplay amount={item.price} className="text-xs text-primary font-medium" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.menuItemId)}
                      className="text-muted-foreground hover:text-destructive h-7 w-7 rounded cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    {/* Note add/edit */}
                    <button
                      type="button"
                      onClick={() => setItemNoteModal({ id: item.menuItemId, note: item.note || '' })}
                      className="text-[11px] text-muted-foreground hover:text-primary underline truncate max-w-45 text-left"
                    >
                      {item.note ? `${t('common:note')}: ${item.note}` : `+ ${t('order:addNote')}`}
                    </button>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-background hover:bg-muted text-foreground flex items-center justify-center cursor-pointer"
                      >
                        <Minus size={10} />
                      </Button>
                      <span className="text-xs font-black text-foreground w-4 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-background hover:bg-muted text-foreground flex items-center justify-center cursor-pointer"
                      >
                        <Plus size={10} />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border bg-background space-y-4">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span className="text-sm">{t('common:total')}</span>
              <CurrencyDisplay amount={cartTotal()} className="text-base text-primary font-black" />
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending || addItemsMutation.isPending}
              className="w-full h-12 rounded-xl font-bold text-white text-sm brand-gradient hover:opacity-90 disabled:opacity-50 glow-brand transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {createOrderMutation.isPending || addItemsMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={16} />
                  {t('order:placeOrder')}
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Note Modal */}
      <Dialog open={itemNoteModal !== null} onOpenChange={(open) => !open && setItemNoteModal(null)}>
        <DialogContent className="sm:max-w-sm bg-card border border-border text-foreground p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">
              {t('order:addNote')}
            </DialogTitle>
          </DialogHeader>

          {itemNoteModal && (
            <div className="space-y-4">
              <Textarea
                value={itemNoteModal.note}
                onChange={(e) => setItemNoteModal({ ...itemNoteModal, note: e.target.value })}
                placeholder={t('order:specialInstructions')}
                className="w-full h-24 p-3 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/30 focus-visible:ring-primary/30 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setItemNoteModal(null)}
                  className="px-3.5 h-9 rounded-lg text-xs bg-muted text-muted-foreground hover:bg-muted/80 font-semibold cursor-pointer border-0"
                >
                  {t('common:cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    updateNote(itemNoteModal.id, itemNoteModal.note)
                    setItemNoteModal(null)
                  }}
                  className="px-3.5 h-9 rounded-lg text-xs bg-primary hover:bg-primary/90 text-white font-semibold cursor-pointer border-0"
                >
                  {t('common:save')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
