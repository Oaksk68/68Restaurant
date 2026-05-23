import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'

export default function CustomerLayout() {
  const { t } = useTranslation('common')
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 glass border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-foreground">{t('appName')}</h1>
        <LanguageSwitcher />
      </header>
      <main className="max-w-2xl mx-auto pb-24">
        <Outlet />
      </main>
    </div>
  )
}
