import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { listAgences, createAgence } from '@/features/agences/api/agences-api'
import ConseillersPanel from '@/features/agences/components/conseillers-panel'
import { useAuth } from '@/features/auth/context/auth-context'
import { listBanques } from '@/features/banques/api/banques-api'

const emptyForm = { nom: '', ville: '', banque: '' }

export default function AgencesPage() {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [rows, setRows] = useState([])
  const [banques, setBanques] = useState([])
  const [banque, setBanque] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selection, setSelection] = useState(null)

  async function load(filtreBanque = banque, silencieux = false) {
    if (!silencieux) setLoading(true)
    setError('')
    try {
      setRows(await listAgences(token, { banque: filtreBanque }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listBanques(token).then(setBanques).catch((err) => setError(err.message))
    load()
  }, [token])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createAgence(token, form)
      setForm(emptyForm)
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
          <Field label="Ville"><input className={inputClass} value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} required /></Field>
          <Field label="Banque">
            <select className={inputClass} value={form.banque} onChange={(e) => setForm({ ...form, banque: e.target.value })} required>
              <option value="">Choisir</option>
              {banques.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
            </select>
          </Field>
          <div className="flex items-end"><Button disabled={saving}>{saving ? 'Enregistrement…' : 'Créer l’agence'}</Button></div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous êtes rattaché à <span className="font-medium text-foreground">{user?.agence_nom}</span>. Vous gérez ses clients ;
          pour les clients des autres agences, seuls les dépôts et retraits au guichet sont possibles.
        </p>
      )}
      {isAdmin ? (
        <div className="flex gap-2">
          <select
            className={inputClass}
            value={banque}
            onChange={(e) => {
              setBanque(e.target.value)
              load(e.target.value)
            }}
            aria-label="Filtrer par banque"
          >
            <option value="">Toutes les banques</option>
            {banques.map((item) => <option key={item.id} value={item.id}>{item.nom}</option>)}
          </select>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            {
              key: 'nom',
              label: 'Agence',
              render: (row) => (
                <span className="font-medium">
                  {row.nom}
                  {row.id === user?.agence_id ? <span className="ml-2 text-xs text-primary">(la vôtre)</span> : null}
                </span>
              ),
            },
            { key: 'ville', label: 'Ville', render: (row) => row.ville },
            { key: 'banque', label: 'Banque', render: (row) => row.banque_nom },
            { key: 'agents', label: 'Agents', render: (row) => row.nombre_agents },
            { key: 'clients', label: 'Clients', render: (row) => row.nombre_clients },
            {
              key: 'voir',
              label: '',
              render: (row) => (
                <div className="flex items-center justify-end gap-3">
                  <Link to={`/app/clients?agence=${row.id}`} className="text-sm text-muted-foreground hover:underline">Ses clients →</Link>
                  {isAdmin || row.id === user?.agence_id ? (
                    <Button type="button" variant="outline" onClick={() => setSelection(row)}>Conseillers</Button>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      )}
      {selection ? (
        <ConseillersPanel
          token={token}
          agence={selection}
          onClose={() => setSelection(null)}
          onChange={() => load(banque, true)}
        />
      ) : null}
    </section>
  )
}
