import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsQuery, useUpdateSettingsMutation } from '../../../hooks/useSettings'
import { Check, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  const { t } = useTranslation(['staff', 'common'])

  // Queries & Mutations
  const { data: settings, isLoading, error } = useSettingsQuery()
  const updateSettings = useUpdateSettingsMutation()

  // Form State
  const [restaurantName, setRestaurantName] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Load settings into local state
  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurant_name)
      if (settings.payment_qr_url) {
        setPreviewUrl(settings.payment_qr_url)
      }
    }
  }, [settings])

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

  // Handle Image File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('restaurant_name', restaurantName)
      if (qrFile) {
        formData.append('payment_qr', qrFile)
      }

      await updateSettings.mutateAsync(formData)
      toast.success(t('common:success'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('common:error'))
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Header */}
      <div className="py-4 border-b border-border">
        <h1 className="text-xl font-black text-primary">{t('staff:settings')}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t('staff:settingsDesc', { defaultValue: 'Configure restaurant branding and payment settings' })}
        </p>
      </div>

      {/* Form Card */}
      <Card className="glass border-border rounded-3xl overflow-hidden shadow-2xl relative bg-card text-foreground">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

            {/* Restaurant Name */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                {t('staff:restaurantName')}
              </Label>
              <Input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full h-12 px-4 bg-background border-border rounded-xl text-foreground text-sm font-bold focus-visible:ring-primary/30"
                placeholder="E.g., Grand Palace"
                required
              />
            </div>

            {/* QR Code Upload */}
            <div className="space-y-3">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-1 block">
                {t('staff:paymentQR')}
              </Label>

              {/* QR preview */}
              {previewUrl && (
                <div className="flex items-center justify-center p-4 bg-background border border-border rounded-2xl max-w-[200px] mx-auto min-h-[160px]">
                  <img
                    src={previewUrl}
                    alt="QR Preview"
                    className="max-h-[140px] rounded-xl object-contain border border-border bg-white p-2"
                  />
                </div>
              )}

              {/* File Upload drag-and-drop placeholder */}
              <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-background text-muted-foreground transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <ImageIcon size={24} className="text-muted-foreground/60" />
                <div className="text-center space-y-1">
                  <span className="text-[11px] font-bold text-foreground block">
                    {qrFile ? qrFile.name : t('staff:uploadQR')}
                  </span>
                  <span className="text-[9px] text-muted-foreground block">
                    Supports JPG, PNG (Max 2MB)
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={updateSettings.isPending}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black text-xs rounded-xl glow-brand transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              {updateSettings.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={14} />
                  {t('common:save')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

