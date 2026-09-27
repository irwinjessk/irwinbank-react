import { useEffect, useState } from 'react'
import DataTable from '@/components/data/data-table'
import { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { listAudit } from '@/features/audit/api/audit-api'

const entites = ['transaction', 'facture', 'client', 'compte', 'banque']

export default function AuditPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [filtres, setFiltres] = useState({ entite: '', action: '', date_min: '', date_max: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(params = filtres) {
    setLoading(true)
    setError('')
    try {
      setRows(await listAudit(token, params))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load({})
  }, [token])

  return (
    <section className="space-y-6">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          load()
        }}
      >
        <select className={inputClass} value={filtres.entite} onChange={(e) => setFiltres({ ...filtres, entite: e.target.value })}>
          <option value="">Toutes les entités</option>
          {entites.map((entite) => <option key={entite} value={entite}>{entite}</option>)}
        </select>
        <input className={inputClass} placeholder="Action" value={filtres.action} onChange={(e) => setFiltres({ ...filtres, action: e.target.value })} />
        <input type="date" className={inputClass} value={filtres.date_min} onChange={(e) => setFiltres({ ...filtres, date_min: e.target.value })} />
        <input type="date" className={inputClass} value={filtres.date_max} onChange={(e) => setFiltres({ ...filtres, date_max: e.target.value })} />
        <Button type="submit" variant="outline">Filtrer</Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'date', label: 'Date', render: (row) => new Date(row.cree_le).toLocaleString('fr-FR') },
            { key: 'acteur', label: 'Acteur', render: (row) => row.acteur_nom ?? 'Système' },
            { key: 'action', label: 'Action', render: (row) => row.action },
            { key: 'entite', label: 'Entité', render: (row) => `${row.entite} #${row.entite_id}` },
            { key: 'resume', label: 'Résumé', render: (row) => row.resume },
          ]}
        />
      )}
    </section>
  )
}
