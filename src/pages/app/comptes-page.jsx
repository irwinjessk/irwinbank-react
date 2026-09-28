import { useEffect, useState } from 'react'
import DataTable from '@/components/data/data-table'
import Field, { inputClass } from '@/components/forms/field'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/context/auth-context'
import { listClients } from '@/features/clients/api/clients-api'
import { cloturerCompte, listComptes, openCompte } from '@/features/comptes/api/comptes-api'
import ClotureDialog from '@/features/comptes/components/cloture-dialog'
import { formatMontant } from '@/lib/money'

export default function ComptesPage() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({ client: '', type_compte: 'COURANT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aCloturer, setACloturer] = useState(null)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    try {
      setRows(await listComptes(token))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listClients(token).then(setClients).catch((err) => setError(err.message))
    load()
  }, [token])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await openCompte(token, form)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function confirmerCloture(choix) {
    const compte = await cloturerCompte(token, aCloturer.id, choix)
    setACloturer(null)
    setError('')
    setMessage(`Compte ${compte.numero_compte} clôturé.`)
    await load()
  }

  const nomClient = (id) => {
    const client = clients.find((item) => item.id === id)
    return client ? `${client.prenom} ${client.nom}` : '—'
  }

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
        <Field label="Client">
          <select className={inputClass} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required>
            <option value="">Choisir</option>
            {clients.map((client) => <option key={client.id} value={client.id}>{client.prenom} {client.nom}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select className={inputClass} value={form.type_compte} onChange={(e) => setForm({ ...form, type_compte: e.target.value })}>
            <option value="COURANT">Courant</option>
            <option value="EPARGNE">Épargne</option>
          </select>
        </Field>
        <div className="flex items-end"><Button disabled={saving}>{saving ? 'Ouverture…' : 'Ouvrir'}</Button></div>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {aCloturer ? (
        <ClotureDialog
          compte={aCloturer}
          comptes={rows}
          clients={clients}
          onConfirm={confirmerCloture}
          onCancel={() => setACloturer(null)}
        />
      ) : null}
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <DataTable
          rows={rows}
          columns={[
            { key: 'numero', label: 'Numéro', render: (row) => row.numero_compte },
            { key: 'client', label: 'Client', render: (row) => nomClient(row.client) },
            { key: 'agence', label: 'Agence', render: (row) => row.agence_nom },
            { key: 'type', label: 'Type', render: (row) => row.type_compte },
            { key: 'solde', label: 'Solde', render: (row) => formatMontant(row.solde) },
            { key: 'statut', label: 'Statut', render: (row) => row.statut },
            {
              key: 'action',
              label: '',
              render: (row) => row.statut === 'OUVERT' ? (
                <Button variant="outline" type="button" onClick={() => { setMessage(''); setACloturer(row) }}>
                  Clôturer
                </Button>
              ) : '—',
            },
          ]}
        />
      )}
    </section>
  )
}
