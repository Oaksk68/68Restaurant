import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
} from '../../../hooks/useMenu'
import CurrencyDisplay from '../../../components/CurrencyDisplay'
import { Plus, Edit, Trash2, Tag, UtensilsCrossed, Check, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function MenuManagementPage() {
  const { t, i18n } = useTranslation(['menu', 'common', 'staff'])

  // Queries
  const { data: categories = [], isLoading: catLoading } = useCategoriesQuery()
  const { data: menuItems = [], isLoading: itemsLoading } = useMenuItemsQuery()

  // Mutations
  const createCat = useCreateCategoryMutation()
  const updateCat = useUpdateCategoryMutation()
  const deleteCat = useDeleteCategoryMutation()

  const createItem = useCreateMenuItemMutation()
  const updateItem = useUpdateMenuItemMutation()
  const deleteItem = useDeleteMenuItemMutation()

  // State
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items')

  // Category Modal State
  const [catModal, setCatModal] = useState<{ open: boolean; editId?: number; nameEn: string; nameMy: string; sortOrder: number }>({
    open: false,
    nameEn: '',
    nameMy: '',
    sortOrder: 0,
  })

  // Item Modal State
  const [itemModal, setItemModal] = useState<{
    open: boolean
    editId?: number
    categoryId: number
    nameEn: string
    nameMy: string
    descriptionEn: string
    descriptionMy: string
    price: number
    isAvailable: boolean
    imageFile: File | null
  }>({
    open: false,
    categoryId: 0,
    nameEn: '',
    nameMy: '',
    descriptionEn: '',
    descriptionMy: '',
    price: 0,
    isAvailable: true,
    imageFile: null,
  })

  const isLoading = catLoading || itemsLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{t('common:loading')}</p>
      </div>
    )
  }

  // --- CATEGORIES HANDLERS ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name_en: catModal.nameEn,
        name_my: catModal.nameMy,
        sort_order: Number(catModal.sortOrder),
      }

      if (catModal.editId) {
        await updateCat.mutateAsync({ id: catModal.editId, data: payload })
      } else {
        await createCat.mutateAsync(payload)
      }
      toast.success(t('common:success'))
      setCatModal({ open: false, nameEn: '', nameMy: '', sortOrder: 0 })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(t('menu:confirmDelete'))) return
    try {
      await deleteCat.mutateAsync(id)
      toast.success(t('common:success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  // --- MENU ITEMS HANDLERS ---
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('category_id', String(itemModal.categoryId))
      formData.append('name_en', itemModal.nameEn)
      formData.append('name_my', itemModal.nameMy)
      formData.append('description_en', itemModal.descriptionEn)
      formData.append('description_my', itemModal.descriptionMy)
      formData.append('price', String(itemModal.price))
      formData.append('is_available', itemModal.isAvailable ? '1' : '0')
      if (itemModal.imageFile) {
        formData.append('image', itemModal.imageFile)
      }

      if (itemModal.editId) {
        await updateItem.mutateAsync({ id: itemModal.editId, formData })
      } else {
        await createItem.mutateAsync(formData)
      }
      toast.success(t('common:success'))
      setItemModal({
        open: false,
        categoryId: 0,
        nameEn: '',
        nameMy: '',
        descriptionEn: '',
        descriptionMy: '',
        price: 0,
        isAvailable: true,
        imageFile: null,
      })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  const handleDeleteMenuItem = async (id: number) => {
    if (!confirm(t('menu:confirmDelete'))) return
    try {
      await deleteItem.mutateAsync(id)
      toast.success(t('common:success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  const toggleItemAvailabilityDirect = async (item: any) => {
    try {
      const formData = new FormData()
      formData.append('is_available', item.is_available ? '0' : '1')
      await updateItem.mutateAsync({ id: item.id, formData })
      toast.success(t('common:success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-primary">{t('staff:menuManagement')}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {menuItems.length} Items &bull; {categories.length} Categories
          </p>
        </div>

        <Button
          onClick={() => {
            if (activeTab === 'items') {
              setItemModal({
                open: true,
                categoryId: categories[0]?.id || 0,
                nameEn: '',
                nameMy: '',
                descriptionEn: '',
                descriptionMy: '',
                price: 0,
                isAvailable: true,
                imageFile: null,
              })
            } else {
              setCatModal({ open: true, nameEn: '', nameMy: '', sortOrder: categories.length + 1 })
            }
          }}
          className="flex items-center gap-1.5 px-4 h-10 bg-primary hover:bg-primary/90 font-bold text-white text-xs rounded-xl glow-brand transition-all cursor-pointer border-0"
        >
          <Plus size={14} />
          {activeTab === 'items' ? t('menu:addItem') : t('menu:addCategory')}
        </Button>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-6">
        <TabsList variant="line" className="border-b border-border w-full justify-start rounded-none h-auto p-0 gap-6 bg-transparent">
          <TabsTrigger value="items" className="pb-3 text-xs font-black rounded-none border-b-2 border-transparent data-[state=active]:[&::after]:bg-primary data-[state=active]:text-primary h-auto p-0 cursor-pointer bg-transparent shadow-none hover:bg-transparent">
            <UtensilsCrossed size={14} className="inline mr-1.5" />
            {t('menu:allItems')}
          </TabsTrigger>
          <TabsTrigger value="categories" className="pb-3 text-xs font-black rounded-none border-b-2 border-transparent data-[state=active]:[&::after]:bg-primary data-[state=active]:text-primary h-auto p-0 cursor-pointer bg-transparent shadow-none hover:bg-transparent">
            <Tag size={14} className="inline mr-1.5" />
            {t('menu:categories')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => {
              const name = i18n.language === 'my' ? item.name_my : item.name_en
              const cat = categories.find((c) => c.id === item.category_id)
              const catName = cat ? (i18n.language === 'my' ? cat.name_my : cat.name_en) : ''

              return (
                <Card
                  key={item.id}
                  className="flex flex-row justify-between glass p-4 border border-border rounded-2xl gap-4 hover:border-border/80 transition-all bg-card text-foreground"
                >
                  <div className="flex gap-4 min-w-0">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl bg-background border border-border shrink-0 overflow-hidden flex items-center justify-center relative">
                      {item.image_path ? (
                        <img src={`/storage/${item.image_path}`} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center brand-gradient opacity-80 text-white font-bold text-[10px] uppercase">
                          {name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground truncate">{name}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">{catName}</p>
                      </div>
                      <div className="text-xs font-black text-foreground mt-1">
                        <CurrencyDisplay amount={item.price} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    {/* Availability Switch */}
                    <Switch
                      checked={item.is_available}
                      onCheckedChange={() => toggleItemAvailabilityDirect(item)}
                      className="cursor-pointer"
                    />

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setItemModal({
                            open: true,
                            editId: item.id,
                            categoryId: item.category_id,
                            nameEn: item.name_en,
                            nameMy: item.name_my,
                            descriptionEn: item.description_en || '',
                            descriptionMy: item.description_my || '',
                            price: item.price,
                            isAvailable: item.is_available,
                            imageFile: null,
                          })
                        }
                        className="h-7 w-7 rounded bg-background text-muted-foreground hover:text-foreground cursor-pointer border border-border flex items-center justify-center"
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="h-7 w-7 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer flex items-center justify-center"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <div className="max-w-xl space-y-2">
            {categories.map((cat) => {
              const name = i18n.language === 'my' ? cat.name_my : cat.name_en
              return (
                <Card
                  key={cat.id}
                  className="glass px-4 py-3 border border-border rounded-xl flex justify-between items-center bg-card text-foreground"
                >
                  <CardContent className="p-0">
                    <h4 className="text-xs font-bold text-foreground">{name}</h4>
                    <span className="text-[10px] text-muted-foreground">Order: {cat.sort_order}</span>
                  </CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCatModal({
                          open: true,
                          editId: cat.id,
                          nameEn: cat.name_en,
                          nameMy: cat.name_my,
                          sortOrder: cat.sort_order,
                        })
                      }
                      className="h-7 w-7 rounded bg-background text-muted-foreground hover:text-foreground cursor-pointer border border-border flex items-center justify-center"
                    >
                      <Edit size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-7 w-7 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- CATEGORY MODAL --- */}
      <Dialog open={catModal.open} onOpenChange={(open) => setCatModal({ ...catModal, open })}>
        <DialogContent className="sm:max-w-sm bg-card border border-border text-foreground p-6">
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Tag size={16} className="text-primary" />
                {catModal.editId ? t('menu:editCategory') : t('menu:addCategory')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:nameEn')}</Label>
                <Input
                  type="text"
                  value={catModal.nameEn}
                  onChange={(e) => setCatModal({ ...catModal, nameEn: e.target.value })}
                  className="w-full h-10 px-3 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                  required
                />
              </div>
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:nameMy')}</Label>
                <Input
                  type="text"
                  value={catModal.nameMy}
                  onChange={(e) => setCatModal({ ...catModal, nameMy: e.target.value })}
                  className="w-full h-10 px-3 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                  required
                />
              </div>
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:sortOrder')}</Label>
                <Input
                  type="number"
                  value={catModal.sortOrder}
                  onChange={(e) => setCatModal({ ...catModal, sortOrder: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                  required
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCatModal({ ...catModal, open: false })}
                className="px-3.5 h-9 rounded-lg text-xs bg-muted text-muted-foreground hover:bg-muted/80 font-semibold cursor-pointer border-0"
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createCat.isPending || updateCat.isPending}
                className="px-3.5 h-9 rounded-lg text-xs bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Check size={14} />
                {t('common:save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MENU ITEM MODAL --- */}
      <Dialog open={itemModal.open} onOpenChange={(open) => setItemModal({ ...itemModal, open })}>
        <DialogContent className="sm:max-w-md bg-card border border-border text-foreground p-6">
          <form onSubmit={handleSaveMenuItem} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <UtensilsCrossed size={16} className="text-primary" />
                {itemModal.editId ? t('menu:editItem') : t('menu:addItem')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1">
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:category')}</Label>
                <Select value={String(itemModal.categoryId)} onValueChange={(val) => setItemModal({ ...itemModal, categoryId: Number(val) })}>
                  <SelectTrigger className="w-full h-11 bg-background border-border text-foreground cursor-pointer rounded-xl">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {i18n.language === 'my' ? c.name_my : c.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:nameEn')}</Label>
                  <Input
                    type="text"
                    value={itemModal.nameEn}
                    onChange={(e) => setItemModal({ ...itemModal, nameEn: e.target.value })}
                    className="w-full h-10 px-3 bg-background border-border rounded-xl text-foreground text-xs focus-visible:ring-primary/30"
                    required
                  />
                </div>
                <div>
                  <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:nameMy')}</Label>
                  <Input
                    type="text"
                    value={itemModal.nameMy}
                    onChange={(e) => setItemModal({ ...itemModal, nameMy: e.target.value })}
                    className="w-full h-10 px-3 bg-background border-border rounded-xl text-foreground text-xs focus-visible:ring-primary/30"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:descriptionEn')}</Label>
                  <Textarea
                    value={itemModal.descriptionEn}
                    onChange={(e) => setItemModal({ ...itemModal, descriptionEn: e.target.value })}
                    className="w-full h-16 p-2.5 bg-background border-border rounded-xl text-foreground text-xs focus-visible:ring-primary/30 resize-none"
                  />
                </div>
                <div>
                  <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:descriptionMy')}</Label>
                  <Textarea
                    value={itemModal.descriptionMy}
                    onChange={(e) => setItemModal({ ...itemModal, descriptionMy: e.target.value })}
                    className="w-full h-16 p-2.5 bg-background border-border rounded-xl text-foreground text-xs focus-visible:ring-primary/30 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:price')} (MMK)</Label>
                  <Input
                    type="number"
                    value={itemModal.price === 0 ? '' : itemModal.price}
                    onChange={(e) => setItemModal({ ...itemModal, price: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-background border-border rounded-xl text-foreground text-xs focus-visible:ring-primary/30 font-bold"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end pb-1.5">
                  <Label className="block text-[10px] font-semibold text-muted-foreground mb-2.5">{t('menu:availability')}</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={itemModal.isAvailable}
                      onCheckedChange={(checked) => setItemModal({ ...itemModal, isAvailable: checked })}
                      className="cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {itemModal.isAvailable ? t('menu:available') : t('menu:unavailable')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('menu:image')}</Label>
                <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 bg-background text-muted-foreground transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setItemModal({ ...itemModal, imageFile: e.target.files?.[0] || null })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <ImageIcon size={22} className="text-muted-foreground/60" />
                  <span className="text-[10px] font-semibold">
                    {itemModal.imageFile ? itemModal.imageFile.name : t('staff:uploadQR')}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setItemModal({ ...itemModal, open: false })}
                className="px-3.5 h-9 rounded-lg text-xs bg-muted text-muted-foreground hover:bg-muted/80 font-semibold cursor-pointer border-0"
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createItem.isPending || updateItem.isPending}
                className="px-3.5 h-9 rounded-lg text-xs bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Check size={14} />
                {t('common:save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

