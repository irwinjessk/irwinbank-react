import { useEffect, useState } from 'react'
import DataTable from '@/components/data/data-table'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { createBanque, listBanques, topBanques } from '@/features/banques/api/banques-api'

export default function BanquesPage() {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [rows, setRows] = useState([])
  const [filtres, setFiltres] = useState({ pays: '', ville: '' })
  const [form, setForm] = useState({ nom: '', pays: '', ville: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load(request = () => listBanques(token)) {
    setLoading(true)
    setError('')
    try {
      setRows(await request())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createBanque(token, form)
      setForm({ nom: '', pays: '', ville: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      {isAdmin ? (
        <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4">
          <Field label="Nom"><input className={inputClass} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></Field>
          <Field label="Pays"><input className={inputClass} value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })} required /></Field>
          <Field label="Ville"><input className={inputClass} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} required /></Field>
          <div className="flex items-end"><Button disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button></div>
        </form>
      ) : null}
      {isAdmin ? (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            load(() => listBanques(token, filtres))
          }}
        >
          <input className={inputClass} placeholder="Pays" value={filtres.pays} onChange={(e) => setFiltres({ ...filtres, pays: e.target.value })} />
          <input className={inputClass} placeholder="Ville" value={filtres.ville} onChange={(e) => setFiltres({ ...filtres, ville: e.target.value })} />
          <Button type="submit" variant="outline">Filtrer</Button>
          <Button type="button" variant="outline" onClick={() => load(() => topBanques(token))}>Top 15</Button>
        </form>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'nom', label: 'Nom', render: (row) => row.nom },
            { key: 'pays', label: 'Pays', render: (row) => row.pays },
            { key: 'ville', label: 'Ville', render: (row) => row.ville },
            { key: 'clients', label: 'Clients', render: (row) => row.nombre_clients },
          ]}
        />
      )}
    </section>
  )
}
