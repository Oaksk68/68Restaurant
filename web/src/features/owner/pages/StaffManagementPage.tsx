import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../../../hooks/useUsers'
import { Plus, Edit, Trash2, Shield, Check, Mail, Key, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '../../../lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export default function StaffManagementPage() {
  const { t } = useTranslation(['staff', 'common'])

  // Queries
  const { data: staffList = [], isLoading, error } = useUsersQuery()

  // Mutations
  const createUser = useCreateUserMutation()
  const updateUser = useUpdateUserMutation()
  const deleteUser = useDeleteUserMutation()

  // Modal State
  const [modal, setModal] = useState<{
    open: boolean
    editId?: number
    name: string
    email: string
    password?: string
    role: 'owner' | 'waiter' | 'chef'
  }>({
    open: false,
    name: '',
    email: '',
    password: '',
    role: 'waiter',
  })

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
          onClick={() => window.location.reload()}
          variant="outline"
          className="h-10 px-4 rounded-xl cursor-pointer"
        >
          {t('common:retry')}
        </Button>
      </div>
    )
  }

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = {
        name: modal.name,
        email: modal.email,
        role: modal.role,
      }
      if (modal.password) {
        payload.password = modal.password
      }

      if (modal.editId) {
        await updateUser.mutateAsync({ id: modal.editId, data: payload })
      } else {
        if (!modal.password) {
          toast.error('Password is required for new accounts')
          return
        }
        await createUser.mutateAsync(payload)
      }

      toast.success(t('common:success'))
      setModal({ open: false, name: '', email: '', password: '', role: 'waiter' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  const handleDeleteStaff = async (id: number) => {
    if (!confirm(t('menu:confirmDelete'))) return
    try {
      await deleteUser.mutateAsync(id)
      toast.success(t('common:success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-black text-primary">{t('staff:staffManagement')}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('staff:manageStaffDesc', { defaultValue: 'Manage staff accounts and permissions' })}
          </p>
        </div>

        <Button
          onClick={() =>
            setModal({
              open: true,
              name: '',
              email: '',
              password: '',
              role: 'waiter',
            })
          }
          className="flex items-center gap-1.5 px-4 h-10 bg-primary hover:bg-primary/90 font-bold text-white text-xs rounded-xl glow-brand transition-all cursor-pointer border-0"
        >
          <Plus size={14} />
          {t('staff:addStaff')}
        </Button>
      </div>

      {/* Staff Table */}
      <Card className="glass border border-border rounded-2xl overflow-hidden bg-card text-foreground">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-border hover:bg-transparent">
              <TableHead className="p-4 font-bold text-muted-foreground">{t('common:name')}</TableHead>
              <TableHead className="p-4 font-bold text-muted-foreground">{t('common:email')}</TableHead>
              <TableHead className="p-4 font-bold text-muted-foreground">{t('common:role')}</TableHead>
              <TableHead className="p-4 font-bold text-muted-foreground">{t('common:date')}</TableHead>
              <TableHead className="p-4 font-bold text-right text-muted-foreground">{t('common:actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((staff) => {
              let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/25'
              if (staff.role === 'owner') badgeColor = 'bg-primary/10 text-primary border-primary/25'
              if (staff.role === 'chef') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/25'

              return (
                <TableRow key={staff.id} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell className="p-4 font-bold text-foreground">{staff.name}</TableCell>
                  <TableCell className="p-4 text-muted-foreground">{staff.email}</TableCell>
                  <TableCell className="p-4">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide h-auto ${badgeColor}`}>
                      {t(`common:${staff.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-4 text-muted-foreground">{formatDate(staff.created_at)}</TableCell>
                  <TableCell className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setModal({
                            open: true,
                            editId: staff.id,
                            name: staff.name,
                            email: staff.email,
                            role: staff.role as any,
                            password: '',
                          })
                        }
                        className="h-7 w-7 rounded bg-background text-muted-foreground hover:text-foreground cursor-pointer border border-border flex items-center justify-center"
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="h-7 w-7 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer flex items-center justify-center"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* --- ADD/EDIT MODAL --- */}
      <Dialog open={modal.open} onOpenChange={(open) => setModal({ ...modal, open })}>
        <DialogContent className="sm:max-w-sm bg-card border border-border text-foreground p-6">
          <form onSubmit={handleSaveStaff} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Shield size={16} className="text-primary" />
                {modal.editId ? t('staff:editStaff') : t('staff:addStaff')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('common:name')}</Label>
                <div className="relative">
                  <UserCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    value={modal.name}
                    onChange={(e) => setModal({ ...modal, name: e.target.value })}
                    className="w-full pl-9 pr-3 h-10 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('common:email')}</Label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="email"
                    value={modal.email}
                    onChange={(e) => setModal({ ...modal, email: e.target.value })}
                    className="w-full pl-9 pr-3 h-10 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                    placeholder="staff@restaurant.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                  {t('common:password')} {modal.editId && '(leave blank to keep same)'}
                </Label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="password"
                    value={modal.password || ''}
                    onChange={(e) => setModal({ ...modal, password: e.target.value })}
                    className="w-full pl-9 pr-3 h-10 bg-background border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                    placeholder="••••••••"
                    required={!modal.editId}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <Label className="block text-[10px] font-semibold text-muted-foreground mb-1">{t('common:role')}</Label>
                <Select value={modal.role} onValueChange={(val: any) => setModal({ ...modal, role: val })}>
                  <SelectTrigger className="w-full h-11 bg-background border-border text-foreground cursor-pointer rounded-xl">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border">
                    <SelectItem value="waiter">{t('common:waiter')}</SelectItem>
                    <SelectItem value="chef">{t('common:chef')}</SelectItem>
                    <SelectItem value="owner">{t('common:owner')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModal({ ...modal, open: false })}
                className="px-3.5 h-9 rounded-lg text-xs bg-muted text-muted-foreground hover:bg-muted/80 font-semibold cursor-pointer border-0"
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createUser.isPending || updateUser.isPending}
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

