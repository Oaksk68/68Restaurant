import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'
import LanguageSwitcher from '../../../components/LanguageSwitcher'
import api from '../../../lib/axios'
import { toast } from 'sonner'
import { UtensilsCrossed, Mail, Lock, LogIn, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { user, setUser, setToken, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'chef' ? '/staff/orders' : '/staff/tables'} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', { email, password })
      setUser(res.data.user)
      setToken(res.data.token)
      toast.success(t('welcome') + ', ' + res.data.user.name + '!')

      // Route based on role
      const role = res.data.user.role
      if (role === 'chef') {
        navigate('/staff/orders')
      } else {
        navigate('/staff/tables')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('error')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Language switcher */}
        <div className="absolute -top-12 right-0">
          <LanguageSwitcher />
        </div>

        {/* Login card */}
        <Card className="rounded-2xl shadow-2xl border-border bg-card">
          <CardContent className="p-8">
            {/* Logo / Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand-gradient glow-brand mb-4">
                <UtensilsCrossed size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t('appName')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('login')}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <Label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('email')}</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 h-12 bg-background border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                    placeholder="owner@restaurant.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label className="block text-xs font-medium text-muted-foreground mb-1.5">{t('password')}</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 h-12 bg-background border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-white brand-gradient hover:opacity-90 disabled:opacity-50 glow-brand transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} />
                    {t('login')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {t('appName')} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
