import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggle = () => {
    const next = i18n.language === 'en' ? 'my' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <Button
      onClick={toggle}
      variant="outline"
      className="flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-semibold bg-card text-foreground border-border hover:bg-muted transition-all cursor-pointer"
    >
      <span className={i18n.language === 'en' ? 'text-primary' : 'text-muted-foreground'}>EN</span>
      <span className="text-border">|</span>
      <span className={i18n.language === 'my' ? 'text-primary' : 'text-muted-foreground'}>MY</span>
    </Button>
  )
}
