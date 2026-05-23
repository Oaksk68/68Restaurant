import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTablesQuery } from '../../../hooks/useTables'
import { Printer, Download } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'

function TableQRCodeCard({ tableId, tableNumber, label }: { tableId: number; tableNumber: number; label: string }) {
  const { t } = useTranslation(['staff', 'common'])
  const [qrUrl, setQrUrl] = useState('')

  // URL that the customer scans: e.g. http://localhost:5173/table/1
  const tableUrl = `${window.location.origin}/table/${tableId}`

  useEffect(() => {
    QRCode.toDataURL(tableUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error(err))
  }, [tableUrl])

  const handleDownload = () => {
    if (!qrUrl) return
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `table_${tableNumber}_qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white text-black p-5 rounded-2xl border border-zinc-200 flex flex-col items-center text-center shadow-lg print:border-none print:shadow-none print:p-4">
      {qrUrl ? (
        <img src={qrUrl} alt={label} className="w-36 h-36 object-contain" />
      ) : (
        <div className="w-36 h-36 flex items-center justify-center text-xs text-zinc-400">
          Generating...
        </div>
      )}
      <span className="text-xs font-black mt-2 tracking-wide uppercase">
        {label}
      </span>
      <span className="text-[9px] text-zinc-500 mt-0.5 print:block">
        Scan to Browse Menu & Order
      </span>

      <div className="flex gap-2 mt-4 w-full no-print">
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 hover:text-zinc-900 font-extrabold text-[10px] rounded-lg transition-colors border border-zinc-300 cursor-pointer"
        >
          <Download size={10} />
          {t('staff:downloadQR')}
        </Button>
      </div>
    </div>
  )
}

export default function QRCodesPage() {
  const { t } = useTranslation(['staff', 'common'])

  // Fetch Tables
  const { data: tables = [], isLoading, error } = useTablesQuery()

  const handlePrintAll = () => {
    window.print()
  }

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

  return (
    <div className="space-y-6">
      {/* Stylesheet for custom printing layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-area {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5rem !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-border no-print">
        <div>
          <h1 className="text-xl font-black text-primary">{t('staff:qrCodes')}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('staff:qrCodesDesc', { defaultValue: 'Generate and print menu ordering QR codes for tables' })}
          </p>
        </div>

        <Button
          onClick={handlePrintAll}
          className="flex items-center gap-1.5 px-4 h-10 bg-primary hover:bg-primary/90 font-bold text-white text-xs rounded-xl glow-brand transition-all cursor-pointer border-0"
        >
          <Printer size={14} />
          {t('staff:printAllQR')}
        </Button>
      </div>

      {/* Grid of QR Codes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 print-area">
        {tables.map((table) => (
          <TableQRCodeCard
            key={table.id}
            tableId={table.id}
            tableNumber={table.number}
            label={table.label || `Table ${table.number}`}
          />
        ))}
      </div>
    </div>
  )
}

