import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { apiDownload } from '@/lib/http'

const formats = [
  { code: 'pdf', libelle: 'PDF' },
  { code: 'xlsx', libelle: 'Excel' },
]

export default function ExportButtons({ ressource, filtres = {} }) {
  const { token } = useAuth()
  const [enCours, setEnCours] = useState(null)
  const [error, setError] = useState('')

  async function exporter(format) {
    setError('')
    setEnCours(format)
    const params = new URLSearchParams(Object.entries({ ...filtres, format }).filter(([, value]) => value))
    try {
      await apiDownload(`/${ressource}/export?${params}`, { token, nomParDefaut: `${ressource}.${format}` })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnCours(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Exporter la liste filtrée :</span>
      {formats.map(({ code, libelle }) => (
        <Button key={code} type="button" variant="outline" disabled={Boolean(enCours)} onClick={() => exporter(code)}>
          {enCours === code ? 'Génération…' : libelle}
        </Button>
      ))}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}
