import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DataTable from '@/components/data/data-table'
import ExportButtons from '@/components/data/export-buttons'
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
  const [form, setForm] = useState({ client: '', type_compte: 'COURANT', solde_initial: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aCloturer, setACloturer] = useState(null)
  const [message, setMessage] = useState('')
  const [tousClients, setTousClients] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const clientFiltre = searchParams.get('client') ?? ''

  async function load() {
    setLoading(true)
    try {
      setRows(await listComptes(token, clientFiltre))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listClients(token).then(setClients).catch((err) => setError(err.message))
    listClients(token, { statut: 'tous' }).then(setTousClients).catch((err) => setError(err.message))
  }, [token])

  useEffect(() => {
    load()
  }, [token, clientFiltre])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const compte = await openCompte(token, form)
      setForm({ ...form, solde_initial: '' })
      setMessage(`Compte ${compte.numero_compte} ouvert${Number(compte.solde) > 0 ? ` avec un dépôt initial de ${formatMontant(compte.solde)}` : ''}.`)
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

  return (
    <section className="space-y-6">
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-4">
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
        <Field label="Solde initial (F CFA)">
          <input type="number" min="0" step="0.01" className={inputClass} value={form.solde_initial} onChange={(e) => setForm({ ...form, solde_initial: e.target.value })} placeholder="0" />
        </Field>
        <div className="flex items-end"><Button disabled={saving}>{saving ? 'Ouverture…' : 'Ouvrir'}</Button></div>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={inputClass}
          value={clientFiltre}
          onChange={(e) => setSearchParams(e.target.value ? { client: e.target.value } : {})}
          aria-label="Filtrer par client"
        >
          <option value="">Tous les clients</option>
          {tousClients.map((client) => (
            <option key={client.id} value={client.id}>{client.prenom} {client.nom} · {client.numero_client}</option>
          ))}
        </select>
        {!loading ? <span className="text-xs text-muted-foreground">{rows.length} compte(s)</span> : null}
      </div>
      <ExportButtons ressource="comptes" filtres={{ client: clientFiltre }} />
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
            {
              key: 'numero',
              label: 'Numéro',
              render: (row) => (
                <Link to={`/app/comptes/${row.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{row.numero_compte}</Link>
              ),
            },
            {
              key: 'client',
              label: 'Client',
              render: (row) => <Link to={`/app/clients/${row.client}`} className="hover:underline">{row.client_nom}</Link>,
            },
            { key: 'agence', label: 'Agence', render: (row) => row.agence_nom },
            { key: 'type', label: 'Type', render: (row) => (row.type_compte === 'EPARGNE' ? 'Épargne' : 'Courant') },
            { key: 'solde', label: 'Solde', render: (row) => formatMontant(row.solde) },
            { key: 'statut', label: 'Statut', render: (row) => (row.statut === 'OUVERT' ? 'Ouvert' : 'Clôturé') },
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
