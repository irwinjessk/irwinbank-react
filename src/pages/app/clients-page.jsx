import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { listBanques } from '@/features/banques/api/banques-api'
import { createClient, listClients } from '@/features/clients/api/clients-api'

const emptyForm = { nom: '', prenom: '', email: '', banque: '' }

export default function ClientsPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [banques, setBanques] = useState([])
  const [nom, setNom] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load(filtres = {}) {
    setLoading(true)
    setError('')
    try {
      setRows(await listClients(token, filtres))
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
      await createClient(token, form)
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
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-5">
        <Field label="Nom"><input className={inputClass} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></Field>
        <Field label="Prénom"><input className={inputClass} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required /></Field>
        <Field label="E-mail"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Banque">
          <select className={inputClass} value={form.banque} onChange={(e) => setForm({ ...form, banque: e.target.value })} required>
            <option value="">Choisir</option>
            {banques.map((banque) => <option key={banque.id} value={banque.id}>{banque.nom}</option>)}
          </select>
        </Field>
        <div className="flex items-end"><Button disabled={saving}>{saving ? 'Inscription…' : 'Inscrire'}</Button></div>
      </form>
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); load({ nom }) }}>
        <input className={inputClass} placeholder="Nom, prénom" value={nom} onChange={(e) => setNom(e.target.value)} />
        <Button type="submit" variant="outline">Rechercher</Button>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'numero', label: 'Numéro', render: (row) => row.numero_client },
            {
              key: 'nom',
              label: 'Client',
              render: (row) => (
                <Link to={`/app/clients/${row.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                  {row.prenom} {row.nom}
                </Link>
              ),
            },
            { key: 'email', label: 'E-mail', render: (row) => row.email },
            { key: 'banque', label: 'Banque', render: (row) => row.banque_nom },
            {
              key: 'fiche',
              label: '',
              render: (row) => <Link to={`/app/clients/${row.id}`} className="text-sm text-muted-foreground hover:underline">Voir la fiche →</Link>,
            },
          ]}
        />
      )}
    </section>
  )
}
