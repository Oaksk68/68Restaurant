import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/useAuthStore'
import LanguageSwitcher from '../LanguageSwitcher'
import {
  ClipboardList, Grid3x3, BarChart3,
  Settings, QrCode, Users, UtensilsCrossed, LogOut, Menu
} from 'lucide-react'
import api from '../../lib/axios'
import { queryClient } from '../../lib/queryClient'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

export default function StaffLayout() {
  const { t } = useTranslation(['common', 'staff'])
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      logout()
      queryClient.clear()
      navigate('/staff/login')
    }
  }

  const navItems = [
    { to: '/staff/orders', icon: ClipboardList, label: t('staff:orderBoard'), roles: ['owner', 'waiter', 'chef'] },
    { to: '/staff/tables', icon: Grid3x3, label: t('staff:tableManagement'), roles: ['owner', 'waiter'] },
    { to: '/staff/menu', icon: UtensilsCrossed, label: t('staff:menuManagement'), roles: ['owner'] },
    { to: '/staff/staff', icon: Users, label: t('staff:staffManagement'), roles: ['owner'] },
    { to: '/staff/reports', icon: BarChart3, label: t('staff:reports'), roles: ['owner'] },
    { to: '/staff/qrcodes', icon: QrCode, label: t('staff:qrCodes'), roles: ['owner'] },
    { to: '/staff/settings', icon: Settings, label: t('staff:settings'), roles: ['owner'] },
  ].filter(item => user && item.roles.includes(user.role))

  const NavItems = () => (
    <nav className="flex-1 space-y-2 overflow-y-auto py-4">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
            }`
          }
          onClick={() => setMobileOpen(false)}
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-bold text-primary">{t('appName')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t(`common:${user?.role}`)}</p>
        </div>
        <NavItems />
        <div className="p-4 border-t border-border space-y-3">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 h-10 rounded-xl text-sm text-foreground hover:text-destructive justify-start cursor-pointer border-0"
          >
            <LogOut size={16} />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground cursor-pointer">
                <Menu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card border-r border-border flex flex-col p-0 gap-0">
              <div className="p-5 border-b border-border">
                <SheetTitle className="text-lg font-bold text-foreground">{t('appName')}</SheetTitle>
                <p className="text-xs text-muted-foreground">{t(`common:${user?.role}`)}</p>
              </div>
              <NavItems />
              <div className="p-4 border-t border-border space-y-3">
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 h-10 rounded-xl text-sm text-destructive hover:bg-destructive/10 justify-start cursor-pointer border-0"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-base font-semibold text-foreground">{t('appName')}</h1>
        </header>
        <main className="container mx-auto flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
